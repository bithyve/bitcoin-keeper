#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

void free_cstring(char *s);

char *hello_world(const char *to);

char *initiate(void);

char *pools(void);

char *gettx0data(void);

char *tx0_preview(const char *inputs_value,
                  const char *pool_str,
                  const char *fees_address,
                  const char *input_structure_str,
                  const char *miner_fee_per_byte,
                  const char *coordinator_fee,
                  const char *n_wanted_max_outputs_str,
                  const char *n_pool_max_outputs,
                  const char *premix_fee_per_byte);

char *into_psbt(const char *preview_str,
                const char *tx0_data_str,
                const char *inputs_str,
                const char *address_bank_str,
                const char *change_addr_str);

char *tx0_push(const char *tx_str, const char *pool_id_str);

char *start(const char *input_str,
            const char *private_key_str,
            const char *destination_addr_str,
            const char *pool_id,
            const char *denomination_str,
            const char *pre_user_hash_str,
            const char *network_str,
            const char *block_height_str,
            const char *signed_registration_message_str);

