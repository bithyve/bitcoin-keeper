#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

const char* hello_world(const char* name);
const char* initiate();
const char* pools();
const char* gettx0data();
const char* tx0_preview(const int inputs_value, const char* pool_str, const char* fees_address, const char* input_structure_str, const int miner_fee_per_byte, const int coordinator_fee, const char* n_wanted_max_outputs_str, const int n_pool_max_outputs, const double premix_fee_per_byte);
const char* into_psbt(const char* preview_str, const char* tx0_data_str, const char* inputs_str, const char* address_bank_str, const char* change_addr_str);
const char* tx0_push(const char* tx_str, const char* pool_id_str);

void whirlpool_destroy_string(const char* cstring);




