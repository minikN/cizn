#!/bin/env bash

function abort() {
	logError "Deleting generation ${CUR_GEN} and exiting."
	rm -rf "${CUR_GEN_ROOT}"
	exit
}
