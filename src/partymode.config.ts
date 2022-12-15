import { IRoomPermissions } from "./models/types"

const defaults: {
    defaults: {
        room_perms: {
            user: Partial<IRoomPermissions>,
            guest: Partial<IRoomPermissions>,
        },
    },
} = {
    defaults: {
        room_perms: {
            user: {
                queue: true,
                video: true,
                time: true,
            },
            guest: {},
        }
    }
}

export default defaults;