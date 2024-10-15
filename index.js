import {RandomAccessLayeredStorage} from "random-access-layered-storage@latest";
import {createFile} from "@zacharygriffee/random-access-idb";

export class RandomAccessIdbWithOverlay extends RandomAccessLayeredStorage {
    constructor(fileName, config = {}) {
        const {
            layeredConfig,
            ... raiConfig
        } = config;
        super(createFile(fileName, raiConfig), layeredConfig);
    }
}

export default RandomAccessIdbWithOverlay;