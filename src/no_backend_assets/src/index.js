import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as no_backend_idl, canisterId as no_backend_id } from 'dfx-generated/no_backend';

const agent = new HttpAgent();
const no_backend = Actor.createActor(no_backend_idl, { agent, canisterId: no_backend_id });

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  const greeting = await no_backend.greet(name);

  document.getElementById("greeting").innerText = greeting;
});
