#!/bin/env bash

###
### Declaring the list of loaded modules
###
declare -a loadedModules=()

###
### Imports module located at `$1'
###
### Behaves relative to the location of the file
### that called it. If called from ~/.config/test
### and `$1' is `./modules/foo' it will look for
### in `~/.config/test/modules/foo'
###
### Will also populate `loadedModules' with the
### given modules.
###
function import() {
	local parent
	local parentPath

	parent="$(caller | awk '{print $2}')"
	parentPath="$(readlink -fm "$parent")"

	local parentDir="${parentPath%/*}"
	local fullPath="${parentDir}/${1}"

	if [ -f "$fullPath" ]; then
		logInfo "Importing module ${1} ..."
		local file
		file="$(basename "$fullPath")"

		local fileName="${file%.*}"

		#loadedModules[$fileName]=$fullPath
		loadedModules+=("$fileName":"$fullPath")

		source "$fullPath"
		#wait
	else
		logError "Can't find ${fullPath} module."
		abort
	fi
}

###
### Return 0 if `$1' is a known module.
### Will return 1 otherwise.
###
function hasModule() {
	if [[ -z $1 ]]; then
		logError "hasModule called with no module."
		return 1
	fi

	for i in "${!loadedModules[@]}"; do
		local moduleInfo="${loadedModules[$i]}"
		if [[ $1 == "${moduleInfo%:*}" ]]; then
			return 0
		fi
	done

	return 1
}
