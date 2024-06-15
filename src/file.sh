###
### Opens file at `$1' and appends `$2' to it.
### File has to exist. Will return `1' otherwise.
###
function withFile() {
	local filePath
	local stateFilePath

	filePath="${CUR_GEN_ROOT}/files$(readlink -fm "$1")"
	stateFilePath="${filePath#*"${CUR_GEN}/"}"

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
function createFile() {
	local filePath
	local stateFilePath

	filePath="${CUR_GEN_ROOT}/files$(readlink -fm "$1")"
	stateFilePath="${filePath#*"${CUR_GEN}/"}"

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
