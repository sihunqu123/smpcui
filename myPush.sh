#!/bin/bash

# useage: ./myPush.sh /opt/github/SMPC-UI/
#   where `/opt/github/SMPC-UI/` is the path of your sp.sh

#set -x

# Script to check the alias output
# Aliases are not expanded when the shell is not interactive, unless the expand_aliases shell option is set using shopt.
shopt -s expand_aliases
declare -r __dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
declare -r __file="${__dir}/$(basename "${BASH_SOURCE[0]}")"

declare -r uname=$(uname)
declare currentOS=""
# to make `grep`  compatible with all platforms
case "$uname" in
    (*Linux*) currentOS='Linux';
              echo "OS is Linux"
              #alias grep="grep"
              ;;
    (*Darwin*) currentOS='Darwin';
              echo "OS is MacOS."

              if command -v ggrep &> /dev/null
              then
                echo "[checked] GNU utils is install, ready to run"
                alias grep="ggrep"
                alias sed="gsed"
              else
                echo "Error: pls make sure ggrep(the GNU grep) is install. Tips: run
                brew install coreutils findutils gnu-tar gnu-sed gawk gnutls gnu-indent gnu-getopt
                For details, pls refer to:
                  https://apple.stackexchange.com/questions/69223/how-to-replace-mac-os-x-utilities-with-gnu-core-utilities"
                exit 2;
              fi
              ;;
    (*CYGWIN*) currentOS='CYGWIN';
              echo "OS is CYGWIN"
              #alias grep="grep"
              ;;
    (*) echo 'error: unsupported platform.'; exit 2; ;;
esac;

echo "currentOS is :${currentOS}"
proj_path=${__dir}/dist
sp_push_path=${__dir}/sp-push
echo "project path is :${proj_path}"
echo "sp.sh path is :${sp_push_path}"

sed -Ei -e '{s/<html lang="en">/<html lang="zh-cn" data-scriptportlet-combine-urls="true" name="need-to-un-hide" >/}' dist/index.html

grep -Pzo "<\/body><\/html>\n?$" dist/index.html && echo "<script>" >> dist/index.html && cat src/index.js >> dist/index.html && echo "</script>" >> dist/index.html

echo "hack done"

cd ${sp_push_path}
#cd /opt/github/DX/wps/script/samples
./sp.sh  push -contentRoot "${proj_path}/" -wcmContentName "SMP-CN"

echo "push done"
