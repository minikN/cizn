#!/bin/env bash

source ./src/log.sh
source ./src/module.sh
source ./src/file.sh

###
### Removes the current generation because something failed
### and ends the process.
###
function abort() {
	logError "Deleting generation ${CUR_GEN} and exiting."
	rm -rf "${CUR_GEN_ROOT}"
	exit
}

###
### Initializes the global state.
###
function initState() {
	local CONFIG="$1"

	CONFIG="$(readlink -fm "$CONFIG")"
	CONFIG_ROOT="${CONFIG%/*}"
	STATE_ROOT="${XDG_STATE_HOME:-$CONFIG_ROOT}"
	GEN_ROOT="${STATE_ROOT}/cizn/generations"
	DER_ROOT="${STATE_ROOT}/cizn/derivations"
	CUR_GEN_ROOT=""
	CUR_GEN=""

	logInfo "Using ${CONFIG} as config ..."
	logInfo "Using ${STATE_ROOT}/cizn as state root ..."

	if [[ ! -e "${CONFIG}" ]]; then
		logError "${CONFIG} doesn't exist. Aborting."
		exit
	fi

	mkdir -p "${GEN_ROOT}"
	mkdir -p "${DER_ROOT}"
}

###
### Makes a generation based on the provided derivation `checksum'.
### If there is a generation that matches the given derivation, it
### will be linked as the current one. If not, a new generation,
### based on the latest one is created and the derivation is
### executed generating the content of the generation.
###
function makeGeneration() {
	local knownGen
	local lastGen

	# Finding a generation that matches the current derivation
	knownGen=$(find "${GEN_ROOT}/" -type d -name "*${checksum}*" 2>/dev/null)

	# Declaring the symlink for the currently used generation
	CUR_GEN="${GEN_ROOT}/current"

	# Getting the newest generation created, so that we know what
	# the next generation should be in case we need one
	lastGen=$(ls -At -I current --time=birth "${GEN_ROOT}" | head -n1)

	if [[ -z "${knownGen}" ]]; then
		# We have no generation matching the current derivation
		if [[ -z "${lastGen}" ]]; then
			# We have no generations at all, we need to create generation 0
			logInfo "No previous generation found. Creating 0 ..."
			CUR_GEN_ROOT="${GEN_ROOT}/0-${checksum}"
		else
			# We have a previous generation, use it to determine
			# the name of the new generation
			local lastGenNum="${lastGen%-*}"
			local newGenNum=$(("$lastGenNum" + 1))
			logInfo "Moving from generation ${lastGenNum} to ${newGenNum} ..."
			CUR_GEN_ROOT="${GEN_ROOT}/${newGenNum}-${checksum}"
		fi

		# Create the folder for the new generation and create symlink
		mkdir -p "${CUR_GEN_ROOT}"
		ln -sfnr "${CUR_GEN_ROOT}" "${GEN_ROOT}/current"

		# Finally, execute the current derivation creating the generation
		local curDer
		curDer=$(readlink -fm "${DER_ROOT}/current")
		logStep "Building generation ..."
		logIn
		# shellcheck disable=SC1090
		source "${curDer}"
		logOut

	else
		# We have a generation matching the current derivation
		# Reuse it by symlinking the current generation to it
		# This avoids rebuilding the generation
		local knownGenDir
		local knownGenNum

		knownGenDir=$(basename "${knownGen}")
		knownGenNum="${knownGenDir%-*}"

		logInfo "Reusing generation ${knownGenNum} ..."

		CUR_GEN_ROOT="${knownGen}"
		ln -sfnr "${knownGen}" "${GEN_ROOT}/current"
	fi
}

###
### Makes a derivation bases on the loaded modules. A checksum is
### created and compared with already existing derivations. If there
### already is one derivation matching the checksum it is linked as
### the current one, if not, the created derivation is linked
### instead.
###
makeDerivation() {
	mkdir -p "/tmp/cizn"

	local tempFile
	tempFile=$(mktemp "/tmp/cizn/derivation.XXXXX")
	echo "#!/bin/env bash" | tee "$tempFile" >/dev/null

	loadModules

	checksum="$(sha1sum "$tempFile" | awk '{print $1;}')"

	if [[ -e "${DER_ROOT}/${checksum}.drv" ]]; then
		logInfo "Resuing derivation ${checksum} ..."
	else
		logInfo "Creating derivation ${checksum} ..."
		cp "${tempFile}" "${DER_ROOT}/${checksum}.drv"
	fi

	ln -sf "./${checksum}.drv" "${DER_ROOT}/current"
}

###
### Builds a configuration by first reading the provided config
### file. It'll then call `makeDerivtion' followed by
### `makeGeneration'. Ultimately, the configuration will be
### reflected at `$STATE_ROOT/cizn/generations/current'.
###
function build() {
	local config="$1"
	local checksum

	logStep "Reading configuration file ..."
	logIn
	# shellcheck disable=SC1090
	source "$config"
	logOut
	logSuccess "Configuration file read"

	logStep "Checking derivation ..."
	logIn
	makeDerivation
	logOut
	logSuccess "Current derivation set"

	logStep "Checking generation ..."
	logIn
	makeGeneration
	logOut
	logSuccess "Current generation set"
}
