import { useLocale } from 'next-intl';
import { type CurrencyRead } from "@/client";
import { useMemo } from 'react';

type PriceProps = {
	amount: number | string;
	currency: CurrencyRead;
};

export function Price({ amount, currency }: PriceProps) {
	const locale = useLocale();
	const value = typeof amount === 'string' ? parseFloat(amount) : amount;

	const formatter = useMemo(() => {
		return new Intl.NumberFormat(locale, {
			style: 'decimal',
			minimumFractionDigits: 0,
			maximumFractionDigits: currency.decimals
		});
	}, [locale, currency.decimals]);

	const formatted = formatter.format(value);

	return <span>{`${formatted} ${currency.symbol}`}</span>;
}