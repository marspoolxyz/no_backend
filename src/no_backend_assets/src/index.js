import { Actor, HttpAgent } from '@dfinity/agent';
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
  const name = document.getElementById("name").value.toString();
  const greeting = await ledger.account_balance_dfx(name);

  document.getElementById("greeting").innerText = greeting;
});

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