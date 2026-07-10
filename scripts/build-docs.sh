
if [  -z "$MWSTWCOM_BUILD_TIDDLYWIKI" ]; then
    MWSTWCOM_BUILD_TIDDLYWIKI=./TiddlyWiki5/tiddlywiki.js
fi

# Set up the build output directory

if [  -z "$MWSTWCOM_BUILD_OUTPUT" ]; then
    MWSTWCOM_BUILD_OUTPUT=./output
fi

mkdir -p $MWSTWCOM_BUILD_OUTPUT

git clone --depth=1 --branch=main "https://github.com/TiddlyWiki/mws.tiddlywiki.com-gh-pages.git" $MWSTWCOM_BUILD_OUTPUT

mkdir -p $MWSTWCOM_BUILD_OUTPUT/static
rm $MWSTWCOM_BUILD_OUTPUT/static/*

# Put the build details into a .tid file so that it can be included in each build (deleted at the end of this script)

echo -e -n "title: $:/build\ncommit: $MWSTWCOM_BUILD_COMMIT\n\n$MWSTWCOM_BUILD_DETAILS\n" > $MWSTWCOM_BUILD_OUTPUT/build.tid

node $MWSTWCOM_BUILD_TIDDLYWIKI \
	./editions/mws-docs \
	--verbose \
	--version \
	--load $MWSTWCOM_BUILD_OUTPUT/build.tid \
	--output $MWSTWCOM_BUILD_OUTPUT \
	--build favicon static index \
	|| exit 1