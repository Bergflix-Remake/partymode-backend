# Bergflix. Partymode Backend 🥳

Partymode backend built with ![express](https://img.shields.io/badge/-Express-yellow?logo=express) and ![socket.io](https://img.shields.io/badge/-Socket.IO-gray?logo=socketdotio)

## How to dev?

- install with `yarn`
- run with `yarn run dev`
- ~~test with `yarn run test`~~
- build with `yarn run build`
- run prod with `yarn run start`

## Notes

- this backend purely serves the functionality to implement the watchroom logic.
- following functionalities are planned and yet to be implemented:
  - [ ] live-chat (supporting utf-16)
  - [ ] emitting stop, pause & timechange events across all users
  - [x] some kind of "room keying", room can be created with a password & can be accessed via a link
  - [x] Registered uses should have badges shown next to their names (Staff, Patreon, etc)
  - [ ] registered users should have the ability to track who is their favorite watch partner

- techstack:
  - ![express](https://img.shields.io/badge/-Express-yellow?logo=express)
  - ![socket.io](https://img.shields.io/badge/-Socket.IO-gray?logo=socketdotio)
  - ![redis](https://img.shields.io/badge/-Redis-red?logo=redis)
