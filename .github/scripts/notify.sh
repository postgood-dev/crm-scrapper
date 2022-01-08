#!/bin/bash -e

function set_job_status_emoji() {
	local emoji="🛎"
	case "$GITHUB_JOB_STATUS" in
	success)
		if [ -n "$GITHUB_JOB_SUCCESS_EMOJI" ]; then
			emoji="$GITHUB_JOB_SUCCESS_EMOJI"
		else
			emoji="🟢"
		fi
		;;
	failure)
		if [ -n "$GITHUB_JOB_FAILURE_EMOJI" ]; then
			emoji="$GITHUB_JOB_FAILURE_EMOJI"
		else
			emoji="🔴"
		fi
		;;
	cancelled)
		if [ -n "$GITHUB_JOB_CANCELLED_EMOJI" ]; then
			emoji="$GITHUB_JOB_CANCELLED_EMOJI"
		else
			emoji="⚪️"
		fi
		;;
	esac
	export GITHUB_JOB_STATUS_EMOJI="$emoji"
}

if [ -n "$GITHUB_JOB_STATUS" ]; then
	set_job_status_emoji

  echo "GITHUB_JOB_STATUS_EMOJI=$(echo $GITHUB_JOB_STATUS_EMOJI)" >> $GITHUB_ENV
fi
