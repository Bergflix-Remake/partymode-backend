export default {
    defaults: {
        room_perms: {
            user: {
                canPlay: true,
                canPause: true,
                canSkip: true,
                canAdd: true,
                canRemove: true,
                canSync: true,
            },
            guest: {
                canPlay: true,
                canPause: true,
                canSkip: true,
                canAdd: false,
                canRemove: false,
                canSync: false,
            },
        }
    }
}