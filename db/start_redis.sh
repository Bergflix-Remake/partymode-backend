if [ ! -f ./librejson.so ]; then
    echo "librejson.so not found. Please make sure you have build the module: https://redis.io/docs/stack/json/#build-from-source"
    exit 1
fi
redis-server --loadmodule ./librejson.so