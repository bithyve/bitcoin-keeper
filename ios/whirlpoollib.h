#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>


struct ExternError {
    int32_t code;
    char *message; // note: nullable
};

// ethkey ffi
const char* hello_world(const char *name);
const char* initiate(const char *torPort);

void whirlpool_destroy_string(const char* cstring);
