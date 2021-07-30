import { Actor, HttpAgent } from '@dfinity/agent';
import { sha224 } from '@dfinity/principal/lib/esm/utils/sha224';
import { getCrc32 } from '@dfinity/principal/lib/esm/utils/getCrc';
import { Principal } from "@dfinity/agent";  

// Imports and re-exports candid interface
import { idlFactory } from './ledger.did.js';
export { idlFactory } from './ledger.did.js';
// CANISTER_ID is replaced by webpack based on node environment
export const canisterId = process.env.ledger_CANISTER_ID;

export const createActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });
  
  // Fetch root key for certificate validation during development
  if(process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch(err=>{
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};
  
/**
 * A ready-to-use agent for the identity canister
 * @type {import("@dfinity/agent").ActorSubclass<import("./ledger.did.js")._SERVICE>}
 */
 export const ledger = createActor(canisterId);

 document.getElementById("clickMeBtn").addEventListener("click", async () => {
  //console.log(Principal.fromText(name));

  const name = document.getElementById("name").value.toString();
  const index = document.getElementById("account-index").value.toString();

  console.log(principalToAccountIdentifier(name,index));

  document.getElementById("greeting").innerText = principalToAccountIdentifier(name,index);

  var arg = {"account":principalToAccountIdentifier(name,index)}

  console.log(ledger.account_balance_dfx(arg));

  const greeting = await ledger.account_balance_dfx(arg);
  console.log(greeting.e8s.value);
  
  
});


const to32bits = num => {
  let b = new ArrayBuffer(4);
  new DataView(b).setUint32(0, num);
  return Array.from(new Uint8Array(b));
}


const principalToAccountIdentifier = (p, s) => {
  const padding = Buffer("\x0Aaccount-id");
  const array = new Uint8Array([
      ...padding,
      ...Principal.fromText(p).toBlob(),
      ...getSubAccountArray(s)
  ]);
  const hash = sha224(array);
  const checksum = to32bits(getCrc32(hash));
  const array2 = new Uint8Array([
      ...checksum,
      ...hash
  ]);
  return toHexString(array2);
};
const toHexString = (byteArray)  =>{
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

const getSubAccountArray = (s) => {
  if (Array.isArray(s)){
    return s.concat(Array(32-s.length).fill(0));
  } else {
    //32 bit number only
    return Array(28).fill(0).concat(to32bits(s ? s : 0))
  }
};
/*
import { idlFactory as no_backend_idl, canisterId as no_backend_id } from 'dfx-generated/no_backend';

const agent = new HttpAgent();
const no_backend = Actor.createActor(no_backend_idl, { agent, canisterId: no_backend_id });

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  const greeting = await no_backend.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
*/