# random-access-idb-with-overlay

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/random-access-idb-with-overlay.svg)
![npm downloads](https://img.shields.io/npm/dm/random-access-idb-with-overlay.svg)

**random-access-idb-with-overlay** (*RAIWO*) is a robust and efficient storage solution that layers [`RandomAccessLayeredStorage`](https://github.com/zacharygriffee/random-access-layered-storage) over [`random-access-idb`](https://github.com/zacharygriffee/random-access-idb). This combination enables seamless and optimized in-browser storage with overlay capabilities, leveraging the strengths of both libraries to provide a flexible and high-performance storage mechanism for your web applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Example](#basic-example)
    - [Advanced Configuration](#advanced-configuration)
- [API Reference](#api-reference)
    - [RandomAccessIdbWithOverlay](#randomaccessidbwithoverlay)
        - [Constructor](#constructor)
- [License](#license)

## Features

- **Layered Storage:** Combines the capabilities of `RandomAccessLayeredStorage` with `random-access-idb` for optimized storage performance.
- **In-Browser Storage:** Utilizes IndexedDB for persistent in-browser storage, ensuring data remains across sessions.
- **Overlay Mechanism:** Efficiently manages data overlays, reducing redundancy and improving access speeds.
- **Easy Integration:** Simple and intuitive API for seamless integration into your projects.
- **Flexible Configuration:** Allows customization of both the underlying `random-access-idb` and the layering behavior through configuration options.
- **Compatibility:** Supports both CommonJS and ES Modules for flexible usage in various environments.

## Installation

You can install **random-access-idb-with-overlay** via [npm](https://www.npmjs.com/):

```bash
# Using npm
npm install random-access-idb-with-overlay

```

## Usage

### Basic Example

Here's a straightforward example demonstrating how to use **random-access-idb-with-overlay** in your project:

```javascript
// Import the library
import RandomAccessIdbWithOverlay from 'random-access-idb-with-overlay';

// Create an instance with a unique filename
const storage = new RandomAccessIdbWithOverlay('my-storage-file');

// Writing data
const bufferToWrite = new Uint8Array([1, 2, 3, 4, 5]);
const offset = 0; // Start at the beginning

storage.write(offset, bufferToWrite, (err) => {
  if (err) {
    console.error('Write failed:', err);
  } else {
    console.log('Data written successfully!');
  }
});

// Reading data
const length = 5; // Number of bytes to read

storage.read(offset, length, (err, data) => {
  if (err) {
    console.error('Read failed:', err);
  } else {
    console.log('Data read:', data);
  }
});
```

### Advanced Configuration

You can customize **random-access-idb-with-overlay** by passing additional configuration options to fine-tune both the underlying `random-access-idb` and the layering behavior. The configuration object is divided into two parts:

- **`raiConfig`**: Configuration options specific to `random-access-idb`.
- **`layeredConfig`**: Configuration options specific to `RandomAccessLayeredStorage`.

```javascript
import RandomAccessIdbWithOverlay from 'random-access-idb-with-overlay';

// Configuration options
const config = {
    layeredConfig, // object containing random-access-layered-storage configuration
    ... // the rest of the config options are added to random-access-idb
};

const storage = new RandomAccessIdbWithOverlay('my-custom-storage', config);

// Proceed with read/write operations as usual
```

**Notes:**

- **`raiConfig`**: This object contains configuration options passed directly to `random-access-idb`. You can customize buffer sizes, concurrency settings, and other IndexedDB-specific options. For detailed configuration options, refer to the [random-access-idb documentation](https://github.com/zacharygriffee/random-access-idb).

- **`layeredConfig`**: This object contains configuration options passed to `RandomAccessLayeredStorage`. You can adjust cache sizes, set eviction policies, and configure other layering behaviors. For detailed configuration options, refer to the [RandomAccessLayeredStorage documentation](https://github.com/zacharygriffee/random-access-layered-storage).

## API Reference

### RandomAccessIdbWithOverlay

A class that combines `RandomAccessLayeredStorage` with `random-access-idb` for optimized in-browser storage with overlay capabilities.

#### Constructor

```javascript
new RandomAccessIdbWithOverlay(fileName, config = {})
```

- **Parameters:**
    - `fileName` (`string`): The name of the storage file. This name is used as the key in IndexedDB to store the data.
    - `config` (`object`, optional): Configuration options for the storage.
        - `raiConfig` (`object`, optional): Configuration options specific to `random-access-idb`.
            - **Available Options:** Refer to the [random-access-idb documentation](https://github.com/zacharygriffee/random-access-idb) for a complete list of configuration options.
        - `layeredConfig` (`object`, optional): Configuration options specific to `RandomAccessLayeredStorage`.
            - **Available Options:** Refer to the [RandomAccessLayeredStorage documentation](https://github.com/zacharygriffee/random-access-layered-storage) for a complete list of configuration options.

- **Throws:**
    - `Error`: If `fileName` is not a non-empty string.

- **Usage:**

  ```javascript
  const storage = new RandomAccessIdbWithOverlay('my-storage-file', {
    layeredConfig: { /* RandomAccessLayeredStorage options */ },
    /* random-access-idb options */
    ...raiConfig
  });
  ```

## License

This project is licensed under the MIT License.

