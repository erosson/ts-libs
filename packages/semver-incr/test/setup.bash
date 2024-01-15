_setup() {
    export PATH="`pwd`/bin:$PATH"
    export TESTDIR="`pwd`"
    export DIR=`mktemp --directory`
    export REPO="$DIR/repo"
    git init $REPO
    cd $REPO
    git remote add origin "file://$REMOTE"
    git config init.defaultBranch main
    git config user.email "test+erosson/semver-incr-npm@example.com"
    git config user.name "Test Test"

    git checkout -b main
    cp -a "$TESTDIR/test/repo-template/." "$REPO"
    git add .
    git commit -m 'feat: init'
    git tag @erosson-test/no-changes/v1.0.0
}
_teardown() {
    cd /
    if [ "$REPO" != "" ]; then
        rm -rf "$REPO"
    fi
}