import vcr


def program_vcr():
    vcr1 = vcr.VCR(
        cassette_library_dir="tests/cassettes",
        record_mode="once",
    )

    return vcr1
