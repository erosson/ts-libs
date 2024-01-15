
setup_file() {
    load ./setup
    _setup
}
teardown_file() {
    load ./setup
    _teardown
}
setup() {
    # paths from https://github.com/brokenpip3/devcontainers-bats/blob/main/test/bats-libs/test.sh
    load '/usr/lib/bats/bats-support/load'
    load '/usr/lib/bats/bats-assert/load'
    load '/usr/lib/bats/bats-file/load'
}

EXE=semver-incr-npm
@test "$EXE: help" {
    run $EXE --help
    assert_output --partial Usage:
}
@test "$EXE: private repo" {
    cd private
    run $EXE
    assert_output "@erosson-test/private: skipping release of private package"
}
@test "$EXE: path flag" {
    run $EXE --path ./private
    assert_output "@erosson-test/private: skipping release of private package"
}
@test "$EXE: missing package.json" {
    run $EXE
    assert_failure
    assert_output --partial "package.json is required, but I couldn't find it."
}
@test "$EXE: nonjson package.json" {
    run $EXE --path package-json-nonjson
    assert_failure
    assert_output --partial "Couldn't determine package name."
}
@test "$EXE: invalid package.json" {
    run $EXE --path package-json-invalid -v
    assert_failure
    assert_output --partial "Couldn't determine package name."
}
@test "$EXE: success" {
    run $EXE --path ./simple
    # TODO this output really ought to be less verbose
    assert_output --partial "(dry-run)"
    assert_output --partial "@erosson-test/simple@1.0.0"
    assert_file_not_exist ./simple/package-lock.json
    refute [ $(git tag -l "@erosson-test/simple/v1.0.0") ]
}
@test "$EXE: no changes -> no release actions" {
    assert [ $(git tag -l "@erosson-test/no-changes/v1.0.0") ]
    run $EXE --path ./no-changes
    assert_output ""
}