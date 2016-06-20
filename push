#! /usr/bin/env bash
################################
#
#  Author:    Abbas Abdulmalik
#  Created:	  March 30, 2016
#  Modified:	 (Date)
#  Original:	 push (name may have changed)
#  Purpose: 	 A single command to commit and push
#          	  local master git repo to remote origin (github)
#  Note: 	    Requires a memo as arguments
#
################################
if [ "${1}" = "" ];
 then 
  echo
  echo "Requires a 'memo' as command line arguments"
  echo Example: $(basename ${0}) changed color of content div
  echo
  exit $?
fi
################################
sudo git config --global credential.helper "cache --timeout=3600"
sudo git add --all
sudo git commit -am"`echo "${@}"`"
sudo git push -u origin master
