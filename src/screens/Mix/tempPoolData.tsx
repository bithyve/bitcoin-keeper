const pools = [
    {
        "id": "0.01btc",
        "denomination": 1000000,
        "fee_value": 50000,
        "must_mix_balance_min": 1000170,
        "must_mix_balance_cap": 1009690,
        "min_anonymity_set": 5,
        "min_must_mix": 2,
        "tx0_max_outputs": 70,
        "n_registered": 345,
        "mix_status": "ConfirmInput",
        "elapsed_time": 23752,
        "n_confirmed": 2
    },
    {
        "id": "0.001btc",
        "denomination": 100000,
        "fee_value": 5000,
        "must_mix_balance_min": 100170,
        "must_mix_balance_cap": 109690,
        "min_anonymity_set": 5,
        "min_must_mix": 2,
        "tx0_max_outputs": 25,
        "n_registered": 325,
        "mix_status": "ConfirmInput",
        "elapsed_time": 297971,
        "n_confirmed": 2
    },
    {
        "id": "0.05btc",
        "denomination": 5000000,
        "fee_value": 175000,
        "must_mix_balance_min": 5000170,
        "must_mix_balance_cap": 5009690,
        "min_anonymity_set": 5,
        "min_must_mix": 2,
        "tx0_max_outputs": 70,
        "n_registered": 218,
        "mix_status": "ConfirmInput",
        "elapsed_time": 247030,
        "n_confirmed": 2
    },
    {
        "id": "0.5btc",
        "denomination": 50000000,
        "fee_value": 1750000,
        "must_mix_balance_min": 50000170,
        "must_mix_balance_cap": 50009690,
        "min_anonymity_set": 5,
        "min_must_mix": 2,
        "tx0_max_outputs": 70,
        "n_registered": 69,
        "mix_status": "ConfirmInput",
        "elapsed_time": 5539993,
        "n_confirmed": 2
    }
]

export const mixingPools = async () => {
    try {
        return new Promise((resolve) => {
            resolve(pools);
        });
    } catch (error) {
        console.log(error);
        return new Promise((resolve) => {
            resolve([]);
        });
    }
}
