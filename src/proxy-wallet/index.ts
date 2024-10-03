import {RIFT_URL_PATTERN} from "./constants";
import injectRiftCS from "./injectRiftCS";
import { RiftApi } from "./rift";

injectRiftCS();

export async function dispatchRequest(data: { data: { method: string; params: any } }, responseCallback: Function) {
  const { method, params } = data.data;
  
  if (typeof (RiftApi as any)[method] === 'function') {
    try {
      const result = await (RiftApi as any)[method](params);
      responseCallback(result);
    } catch (error) {
      console.error(`Error in method ${method}:`, error);
      responseCallback({ error: `Error executing ${method}` });
    }
  } else {
    console.error("Unknown method:", method);
    responseCallback({ error: `Unknown method: ${method}` });
  }
}



console.log("Background script loaded");
