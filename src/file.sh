###
### Will write the `withRealFile' function to the
### current derivation with the given arguments
###
function withFile() {
	# shellcheck disable=SC2154
	tee -a "$tempFile" <<EOF >/dev/null
withRealFile "${1}" \
"${2}"
EOF
}

###
### Will write the `createRealFile' function to the
### current derivation with the given arguments
###
function createFile() {
	tee -a "$tempFile" <<EOF >/dev/null
createRealFile "${1}" \
"${2}"
EOF
}

###
### Opens file at `$1' and appends `$2' to it.
### File has to exist. Will return `1' otherwise.
###
function withRealFile() {
	local filePath
	local stateFilePath
	local curGenPath

	filePath="${CUR_GEN_ROOT}/files$(readlink -fm "$1")"
	curGenPath=$(readlink -fm "${CUR_GEN}")
	stateFilePath="${filePath#*"${curGenPath}/"}"

	if [ ! -f "$filePath" ]; then
		logError "File $stateFilePath doesn't exist."
		abort
	fi

	logInfo "Writing to file ${stateFilePath} ..."
	tee -a "$filePath" <<EOF >/dev/null
$2
EOF
}

###
### Creates file at `$1' and writes `$2' to it.
### File has to not exist. Will return `1'
### otherwise.
###
function createRealFile() {
	local filePath
	local stateFilePath
	local curGenPath

	filePath="${CUR_GEN_ROOT}/files$(readlink -fm "$1")"
	curGenPath=$(readlink -fm "${CUR_GEN}")
	stateFilePath="${filePath#*"${curGenPath}/"}"

	if [ -f "$filePath" ]; then
		logError "File $filePath already exists."
		abort
	fi

	logInfo "Creating file ${stateFilePath} ..."
	mkdir -p "$(dirname "$filePath")"
	tee "$filePath" <<EOF >/dev/null
$2
EOF
}
