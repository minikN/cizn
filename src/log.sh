#!/bin/env bash

# Black        0;30     Dark Gray     1;30
# Red          0;31     Light Red     1;31
# Green        0;32     Light Green   1;32
# Brown/Orange 0;33     Yellow        1;33
# Blue         0;34     Light Blue    1;34
# Purple       0;35     Light Purple  1;35
# Cyan         0;36     Light Cyan    1;36
# Light Gray   0;37     White         1;37
#
CUR_LEVEL=1

function logIn() { ((CUR_LEVEL += 1)); }
function logOut() { ((CUR_LEVEL -= 1)); }

BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

repeat() {
	# $1=number of patterns to repeat
	# $2=pattern
	# $3=output variable name
	local tmp
	printf -v tmp '%*s' "$1"
	printf -v "$3" '%s' "${tmp// /$2}"
}

function log() {
	repeat $CUR_LEVEL = INDENT
	echo -e "${INDENT}> [${1}""${2}""${NC}] "${3}""
}
function logError() { log "$RED" "ERROR" "$1"; }
function logInfo() { log "$BLUE" "INFO" "$1"; }
function logSuccess() { log "$GREEN" "SUCCESS" "$1"; }
