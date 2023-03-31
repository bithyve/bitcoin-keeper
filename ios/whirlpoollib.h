#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>


struct ExternError {
    int32_t code;
    char *message; // note: nullable
};

const char* hello_world(const char* name);
const char* initiate();
const char* pools();
const char* gettx0data();
const char* tx0preview(const int32_t inputsValue, const char* poolStr, const int32_t premixFeePerByte,  const char* inputStructureStr, const int32_t minerFeePerByte, const int32_t coordinatorFee, const char* nWantedMaxOutputsStr);
