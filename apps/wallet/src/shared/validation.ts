// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import * as Yup from 'yup';

import { formatBalance } from '_app/hooks/useFormatCoin';
import {
    DEFAULT_GAS_BUDGET_FOR_TRANSFER,
    GAS_SYMBOL,
    GAS_TYPE_ARG,
} from '_redux/slices/sui-objects/Coin';

export function createTokenValidation(
    coinType: string,
    coinBalance: bigint,
    coinSymbol: string,
    gasBalance: bigint,
    decimals: number
) {
    return Yup.mixed()
        .required()
        .transform((_, original) => {
            return new BigNumber(original);
        })
        .test(
            'valid',
            'The value provided is not valid.',
            (value: BigNumber) => {
                if (value.isNaN() || !value.isFinite()) {
                    return false;
                }
                return true;
            }
        )
        .test(
            'min',
            `\${path} must be greater than 0 ${coinSymbol}`,
            (amount: BigNumber) => amount.gt(0)
        )
        .test(
            'max',
            `\${path} must be less than ${formatBalance(
                coinBalance,
                decimals
            )} ${coinSymbol}`,
            (amount: BigNumber) =>
                amount.shiftedBy(decimals).lte(coinBalance.toString())
        )
        .test(
            'max-decimals',
            `The value exeeds the maximum decimals (${decimals}).`,
            (value: BigNumber) => {
                return value.shiftedBy(decimals).isInteger();
            }
        )
        .test(
            'gas-balance-check',
            `Insufficient ${GAS_SYMBOL} balance to cover gas fee (${formatBalance(
                DEFAULT_GAS_BUDGET_FOR_TRANSFER,
                decimals
            )} ${GAS_SYMBOL})`,
            (amount: BigNumber) => {
                try {
                    let availableGas = gasBalance;
                    if (coinType === GAS_TYPE_ARG) {
                        availableGas -= BigInt(
                            amount.shiftedBy(decimals).toString()
                        );
                    }
                    // TODO: implement more sophisticated validation by taking
                    // the splitting/merging fee into account
                    return availableGas >= DEFAULT_GAS_BUDGET_FOR_TRANSFER;
                } catch (e) {
                    return false;
                }
            }
        )
        .label('Amount');
}