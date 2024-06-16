#!/bin/env bash

###
### List of configuration-wide modules
###
declare -a loadedModules=()

###
### List of configuration-wide options
###
declare -A loadedOptions=()

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
		local file
		file="$(basename "$fullPath")"

		local fileName="${file%.*}"

		local alreadyAdded=0
		for i in "${!loadedModules[@]}"; do
			local moduleName="${loadedModules[$i]%:*}"
			if [[ $fileName == "$moduleName" ]]; then
				alreadyAdded=1
			fi
		done

		if [[ $alreadyAdded == 0 ]]; then
			logInfo "Importing module ${1} ..."
			loadedModules+=("$fileName":"$fullPath")
		fi

		source "$fullPath"

		for i in "${!options[@]}"; do
			if [[ -n "${loadedOptions[$i]}" ]]; then
				logWarn "Option $i already exists. Overwritten from $1"
			fi
			loadedOptions[$i]=${options[$i]}
		done

		#wait
	else
		logError "Can't find ${fullPath} module."
		abort
	fi
}

function executeModules() {
	for i in "${!loadedModules[@]}"; do
		local moduleName="${loadedModules[$i]%:*}"
		local modulePath="${loadedModules[$i]#*:}"
		executeModule "$moduleName" "$modulePath"
	done
}

function executeModule() {
	logInfo "Executing ${1} module ..."
	source "$2"

	logIn
	module
	logOut
}

###
### Return 0 if `$1' is a known module.
### Will return 1 otherwise.
###
function hasModule() {
	if [[ -z $1 ]]; then
		logWarn "hasModule called with no module name. Will return false."
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
