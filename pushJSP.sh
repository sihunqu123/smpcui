#!/bin/bash

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


# load env first

source indexJSP/pushJSP-env.sh

dirType=""
if [ "${isDev:-}" = "true" ] || [ "${isDev:-}" = "TRUE" ]; then
  dirType="SMP-dev"
else
  dirType="SMP"
fi

sourcePath=dist/${dirType}
targetPath=${wp_profile_path}/installedApps/dockerCell/PA_WCM_Authoring_UI.ear/ilwwcm-authoring.war/jsp/html/

echo "currentOS is :${currentOS}"
sp_push_path=${__dir}/sp-push
echo "dirType: ${dirType}"
echo "source path is: ${sourcePath}"
echo "target path is: ${targetPath}"

echo "begin: copy entry JSP done..."
cp -fRpv indexJSP/${dirType}/* dist/${dirType}/

echo "Done: copy entry JSP done"
echo "begin: copy build result to portal..."

# cp -fRpv dist/${dirType} /opt/github/DX/dx-docker-compose/volumes/core/wp_profile/installedApps/dockerCell/PA_WCM_Authoring_UI.ear/ilwwcm-authoring.war/jsp/html/
cp -fRpv dist/${dirType} "$targetPath"

echo "Done: copy build result into portal"

echo -ne "  Next Step:\nset the LaunchJSPPage of Web-Authoring-Protlet as jsp/html/${dirType}/home.jsp or jsp/html/${dirType}/approve.jsp"

