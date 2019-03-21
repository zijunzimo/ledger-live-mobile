// @flow

import { Buffer } from "buffer";
import { delay } from "./promise";

export type ApduMock = {
  exchange: Buffer => Promise<Buffer>,
  close: () => Promise<void>,
};

const genericErrorResponse = Buffer.from([0x6f, 0x42]);
const successResponse = Buffer.from([0x90, 0x00]);

export default (arg: {
  getDeviceName: () => Promise<string>,
  setDeviceName: string => Promise<void>,
  getAddress: () => Promise<{
    publicKey: string,
    address: string,
    chainCode: string,
  }>,
}): ApduMock => {
  async function exchange(input: Buffer) {
    await delay(100);
    /*
    const cla = input.readUInt8(0);
    const ins = input.readUInt8(1);
    */
    const clains = input.slice(0, 2).toString("hex");
    // const p1 = input.readUInt8(2);
    // const p2 = input.readUInt8(3);
    const dataLength = input.readUInt8(4);
    const data = input.slice(5, 5 + dataLength);

    switch (clains) {
      case "e001": {
        // get device info
        // answer from a nano s 1.5.5 that have allowed manager
        return Buffer.from(
          "3110000405312e352e3504ae00000004312e37002013fe17e06cf2f710d33328aa46d1053f8fadd48dcaeca2c5512dd79e2158d5779000",
          "hex",
        );
      }
      case "e0d2": {
        // get name
        return Buffer.concat([
          Buffer.from(await arg.getDeviceName()),
          successResponse,
        ]);
      }
      case "e0d4": {
        // set name
        arg.setDeviceName(await data.toString());
        return successResponse;
      }
      case "e040": {
        // get address
        try {
          const addr = await arg.getAddress();

          const pubKey = Buffer.from(addr.publicKey, "hex");
          const address = Buffer.from(addr.address, "ascii");
          const chainCode = Buffer.from(addr.chainCode, "hex");

          return Buffer.concat([
            Buffer.from([pubKey.length]),
            pubKey,
            Buffer.from([address.length]),
            address,
            chainCode,
            successResponse,
          ]);
        } catch (e) {
          return genericErrorResponse;
        }
      }
      default:
        return successResponse;
    }
  }

  async function close() {
    return delay(100);
  }

  return { exchange, close };
};
