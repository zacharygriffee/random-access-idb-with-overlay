import {test, solo} from "brittle";
import {allLoadedFiles, createFile} from "@zacharygriffee/random-access-idb";
import RandomAccessIdbWithOverlay from "./index.js";
import {RandomAccessLayeredStorage} from "random-access-layered-storage";
import 'fake-indexeddb/auto';
import {promisify} from "./lib/promisify.js";
import b4a from "b4a";
import RAM from "random-access-memory";

const cleanupArray = [];



export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function cleanup(store, fn) {
    if (!store && !fn) {
        return Promise.all(cleanupArray.map(({fn, store}) => fn(store)));
    } else if (store) {
        fn ||= async store => {
            await promisify(store, "close");
            await promisify(store, "unlink");
        };
        cleanupArray.push({fn, store});
    }
    return store;
}

function defaultMaker(file, opts) {
    return cleanup(new RandomAccessIdbWithOverlay(file, opts));
}

export function newFile(config) {
    const randomName = makeid(10) + ".txt";
    const file = defaultMaker(randomName, config);

    return {
        file,
        close: () => promisify(file, 'purge')
    };
}

// // Mock the `createFile` method
// test('RandomAccessIdbWithOverlay - instantiates correctly', async (t) => {
//     const fileName = 'test-file';
//     const config = { option: true };
//
//     // Spy on the createFile function
//     const originalCreateFile = createFile;
//     let createFileCalled = false;
//     let passedFileName = '';
//     let passedConfig = {};
//
//     createFile = (fileNameArg, configArg) => {
//         createFileCalled = true;
//         passedFileName = fileNameArg;
//         passedConfig = configArg;
//         return {}; // return mock object to simulate file creation
//     };
//
//     const instance = new RandomAccessIdbWithOverlay(fileName, config);
//
//     // Test the createFile call
//     t.ok(createFileCalled, 'createFile should be called');
//     t.is(passedFileName, fileName, 'FileName should be passed correctly');
//     t.alike(passedConfig, config, 'Config should be passed correctly');
//
//     // Test inheritance
//     t.ok(instance instanceof RandomAccessLayeredStorage, 'Should inherit from RandomAccessLayeredStorage');
//
//     // Restore the original createFile
//     createFile = originalCreateFile;
// });

test("write operation only", {timeout: 600000}, function (t) {
    t.plan(2);
    const {file: ras} = newFile();

    // Test only the write operation
    ras.write(0, b4a.from("hello world!"), function (err) {
        t.absent(err, 'Write operation should complete without error');
        t.pass("Write operation completed");
    });

    t.teardown(() => cleanup());
});

test("default maker", {timeout: 600000}, function (t) {
    t.plan(3);
    const {file: ras} = newFile();

    // Write operation
    ras.write(0, b4a.from("hello world!"), function (err) {
        t.absent(err, 'Write operation should complete without error');
        // Read operation
        ras.read(0, 5, function (err, buf) {
            t.absent(err, 'Read operation should complete without error');
            t.is(b4a.toString(buf), "hello", 'Read data should match expected');
        });
    });

    t.teardown(() => cleanup());
});

test('chunk deletion during truncate', function (t) {
    t.plan(5);
    const {file} = newFile({chunkSize: 1024});
    const chunk = b4a.alloc(3072, 0xff); // Fill with 3 chunks worth of data

    // Write the data
    file.write(0, chunk, function (err) {
        t.absent(err, 'Write operation should complete without error');

        // Truncate the file at 1024 bytes
        file.truncate(1024, function (err) {
            t.absent(err, 'Truncate operation should complete without error');

            // Verify file length after truncation
            file.read(0, file.length, function (err, remainingData) {
                t.absent(err, 'Read operation should complete without error');
                t.is(file.length, 1024, 'File length should be 1024 after truncation');
                t.ok(b4a.equals(remainingData, b4a.alloc(1024, 0xff)), 'Data beyond the truncation point should be removed');
            });
        });
    });

    t.teardown(() => cleanup());
});

test('random-access-idb: write and read', async (t) => {
    t.plan(1);
    const ras = createFile('idb-test-file');

    await promisify(ras, 'write', 0, b4a.from('test data'));
    const data = await promisify(ras, 'read', 0, 9);

    t.is(b4a.toString(data), 'test data', 'Should read written data correctly');

    t.teardown(() => cleanup());
});

test('random-access-idb: stat after write', async (t) => {
    t.plan(1);
    const ras = createFile('idb-metadata-file');

    await promisify(ras, 'write', 0, b4a.from('metadata test'));
    const stats = await promisify(ras, 'stat');

    t.is(stats.length, 13, 'Metadata should reflect file size');

    t.teardown(() => cleanup());
});

test('Layered storage: initialize with random-access-idb', async (t) => {
    t.plan(1);
    const ras = defaultMaker("base-layer-file");
    const storage = new RandomAccessLayeredStorage(ras);

    // Check that the storage initializes and metadata is accessible
    await promisify(storage, 'write', 0, b4a.from('layer init'));
    const data = await promisify(storage, 'read', 0, 10);

    t.is(b4a.toString(data), 'layer init', 'Base layer should write and read correctly in layered storage');

    t.teardown(() => cleanup());
});

test('Layered storage: write and read with layers', async (t) => {
    t.plan(1);
    const ras = defaultMaker("layered-file");
    const storage = new RandomAccessLayeredStorage(ras);

    // Write data to the base layer
    await promisify(storage, 'write', 0, b4a.from('base data '));

    // Now write to a new layer, which should be independent
    await promisify(storage, 'write', 5, b4a.from('layer data'));

    // Read the data back, ensuring both writes are applied correctly
    const data = await promisify(storage, 'read', 0, 15);
    t.is(b4a.toString(data), 'base layer data', 'Layered storage should combine writes');

    t.teardown(() => cleanup());
});


test('Simple Test: random-access-memory', async (t) => {
    const ras = new RAM(); // Correctly instantiate random-access-memory as an instance

    // Register teardown to ensure cleanup after the test
    t.teardown(async () => {
        try {
            console.log(`Closing random-access-memory`);
            await promisify(ras, 'close');
            console.log(`Closed random-access-memory`);
            if (ras.unlink) {
                console.log(`Unlinking random-access-memory`);
                await promisify(ras, 'unlink');
                console.log(`Unlinked random-access-memory`);
            }
        } catch (error) {
            console.error('Cleanup failed for random-access-memory:', error);
        }
    })

    const writeBuffer = b4a.from('Hello, World!');
    const writeOffset = 0;
    console.log(`Writing 'Hello, World!' to random-access-memory at offset ${writeOffset}`);
    await promisify(ras, "write", writeOffset, writeBuffer);
    console.log(`Finished writing 'Hello, World!' to random-access-memory at offset ${writeOffset}`);

    const readBuffer = await promisify(ras, "read", writeOffset, writeBuffer.length);
    console.log(`Read buffer from random-access-memory at offset ${writeOffset}:`, readBuffer.toString());

    t.ok(b4a.equals(readBuffer, writeBuffer), 'Buffer should match after write and read');
});

