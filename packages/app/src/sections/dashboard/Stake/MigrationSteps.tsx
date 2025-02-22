import { formatNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useMemo, useCallback, FC, memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { unstakeKwentaV2, vestEscrowedRewardsV2 } from 'state/staking/actions'
import {
	selectIsUnstakingKwenta,
	selectIsVestingEscrowedRewards,
	selectStakedKwentaBalanceV2,
	selectTotalVestableV2,
	selectVestEscrowV2Entries,
} from 'state/staking/selectors'
import media from 'styles/media'

const MigrationSteps: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const stakedKwentaBalanceV2 = useAppSelector(selectStakedKwentaBalanceV2)
	const totalVestableV2 = useAppSelector(selectTotalVestableV2)
	const escrowV2Entries = useAppSelector(selectVestEscrowV2Entries)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)
	const isVestingEscrowedRewards = useAppSelector(selectIsVestingEscrowedRewards)

	const handleUnstakeKwenta = useCallback(
		() => dispatch(unstakeKwentaV2(wei(stakedKwentaBalanceV2).toBN())),
		[dispatch, stakedKwentaBalanceV2]
	)

	const handleVest = useCallback(
		() => dispatch(vestEscrowedRewardsV2(escrowV2Entries)),
		[dispatch, escrowV2Entries]
	)

	const migrationSteps = useMemo(
		() => [
			{
				key: 'step-1',
				copy: t('dashboard.stake.tabs.revert.step-1-copy'),
				label: t('dashboard.stake.tabs.revert.staked'),
				value: formatNumber(stakedKwentaBalanceV2, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.revert.unstake'),
				onClick: handleUnstakeKwenta,
				active: stakedKwentaBalanceV2.gt(0),
				loading: isUnstakingKwenta,
				visible: true,
			},
			{
				key: 'step-2',
				copy: t('dashboard.stake.tabs.revert.step-2-copy'),
				label: t('dashboard.stake.tabs.revert.reclaimable'),
				value: formatNumber(totalVestableV2, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.revert.reclaim'),
				onClick: handleVest,
				active: stakedKwentaBalanceV2.eq(0) && totalVestableV2.gt(0),
				loading: isVestingEscrowedRewards,
				visible: totalVestableV2.gt(0),
			},
		],
		[
			handleUnstakeKwenta,
			handleVest,
			isUnstakingKwenta,
			isVestingEscrowedRewards,
			stakedKwentaBalanceV2,
			t,
			totalVestableV2,
		]
	)

	return (
		<StepsContainer columnGap="15px">
			{migrationSteps
				.filter(({ visible }) => visible)
				.map(({ key, copy, label, value, buttonLabel, active, onClick, loading }, i) => (
					<StyledStakingCard key={key} $active={active}>
						<StyledHeading variant="h4">
							<Trans
								i18nKey="dashboard.stake.tabs.migrate.step"
								values={{ index: i + 1 }}
								components={[<span />]}
							/>
						</StyledHeading>
						<Body size="small" color="secondary">
							{copy}
						</Body>
						<Spacer height={25} />
						<FlexDivRowCentered>
							<FlexDivCol rowGap="5px">
								<Body size="small" color="secondary">
									{label}
								</Body>
								<Body size="large" color="preview">
									{value}
								</Body>
							</FlexDivCol>
							<Button
								variant="yellow"
								size="small"
								textTransform="uppercase"
								isRounded
								disabled={!active || loading}
								loading={loading}
								onClick={onClick}
							>
								{buttonLabel}
							</Button>
						</FlexDivRowCentered>
					</StyledStakingCard>
				))}
		</StepsContainer>
	)
})

const StepsContainer = styled(FlexDivRowCentered)`
	margin: 30px 0 15px;
	${media.lessThan('lg')`
		flex-direction: column;
		row-gap: 25px;
		margin: 0;
		margin-bottom: 25px;
	`}
`

const StyledStakingCard = styled(StakingCard)<{ $active: boolean }>`
	width: 100%;
	column-gap: 10px;
	opacity: ${(props) => (props.$active ? '1' : '0.3')};
	padding: 25px;
	height: 150px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.pill.yellow.outline.border};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

export default MigrationSteps
