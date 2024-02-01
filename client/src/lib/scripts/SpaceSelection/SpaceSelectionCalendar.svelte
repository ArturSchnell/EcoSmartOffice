<script context="module" lang="ts">
    import { get } from 'svelte/store';
    import { getDateDetails } from '../ReqRes/floor';

    /**
     * Sets the date details for the tables by retrieving the information from the backend
     * @returns {Promise<any>} promise that resolves when the date details have been successfully set
     */
    export const setDateDetails = async (): Promise<any> => {
        await getDateDetails(get(selectedFloor), get(dateString), get(tokenMSAL)).then((tableDetails: any) => {
            tables.set(
                get(tables).map((table) => {
                    return { ...table, state: undefined, user: undefined, isItMe: false };
                }),
            );
            if (tableDetails) {
                tableDetails.forEach((tableDetail: any) => {
                    get(tables).forEach((table) => {
                        if (tableDetail.tableId === table.tableId) {
                            table.userId = tableDetail.userId;
                            table.state = tableDetail.state;
                            table.isItMe = tableDetail.isItMe;
                            table.isLoaded = false;
                            table.user = undefined;
                        }
                    });
                });
            }
        });
    };
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { dateString, selectedFloor, tables, tokenMSAL } from '../stores';
    import type { DateObject } from '../Types/types';

    const germanWeekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    let weekDates = [];
    let weekNumber: number;
    let offset = 0;

    /**
     * Sets the week dates based on the current date and offset
     * @returns {void}
     */
    const setWeek = (): void => {
        const currentDate = new Date();
        const weekdayIndex = currentDate.getDay() - 1; // weekday (0-6), sunday = 0

        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - weekdayIndex + offset);

        weekDates = Array.from({ length: 7 }, (_, index): DateObject => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();

            return {
                dateString: `${year}-${month}-${day}`,
                dayOfWeek: germanWeekdays[index],
                date: `${day}.${month}`,
            };
        });
    };

    /**
     * Initializes the component on mount
     * Sets the current date, week number, and week dates
     * @returns {void}
     */
    onMount((): void => {
        const date = new Date();
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        $dateString = `${year}-${month}-${day}`;
        setWeekNumber();
        setWeek();
    });

    /**
     * Sets the week number based on the current date and an optional offset
     * @param {number} offset the optional offset to adjust the week number (default: 0)
     * @returns {void}
     */
    const setWeekNumber = (offset: number = 0): void => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + offset);
        const calcWeekNumber = new Date(currentDate.getFullYear(), 0, 1);
        const days = Math.floor((currentDate.getTime() - calcWeekNumber.getTime()) / (24 * 60 * 60 * 1000));
        weekNumber = Math.ceil(days / 7);
    };

    /**
     * Decreases the offset by the specified number of days and updates the week number and week dates accordingly
     * @param {number} days the number of days to decrease the offset by
     * @returns {void}
     */
    function decreaseDays(days: number): void {
        offset -= days;
        setWeekNumber(offset);
        setWeek();
    }

    /**
     * Increases the offset by the specified number of days and updates the week number and week dates accordingly
     * @param {number} days the number of days to increase the offset by
     * @returns {void}
     */
    function increaseDays(days: number): void {
        offset += days;
        setWeekNumber(offset);
        setWeek();
    }

    /**
     * Sets the date string to the specified date and retrieves the corresponding day details
     * @param {string} date the date string in the format 'YYYY-MM-DD'
     * @returns {Promise<void>}
     */
    async function setDayInfos(date: string): Promise<void> {
        $dateString = date;
        setDateDetails();
    }
</script>

<div class="wrapper">
    <input class="d-none d-md-block" type="date" name="day" value="" />
    <div class="weekNumber">KW {weekNumber}</div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="icon"
        on:click="{() => {
            decreaseDays(7);
        }}"
    >
        <i class="fa-solid fa-chevron-left"></i>
    </div>
    {#each weekDates as date}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="item"
            class:selected="{$dateString === date.dateString}"
            on:click="{() => {
                setDayInfos(date.dateString);
            }}"
        >
            {date.dayOfWeek}
            <span class="d-none d-md-inline">
                {date.date}
            </span>
        </div>
    {/each}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="icon"
        on:click="{() => {
            increaseDays(7);
        }}"
    >
        <i class="fa-solid fa-chevron-right"></i>
    </div>
</div>

<style>
    div.wrapper {
        width: 100%;
        height: 40px;
        background: #3c3c3b;
        display: flex;
        color: #fff;
        line-height: 40px;
    }

    div.weekNumber {
        padding: 0 5px 0 5px;
    }

    input {
        color: transparent;
        background-color: transparent;
        border: none;
        color-scheme: dark;
        margin: 0 20px;
        width: 20px;
        line-height: 40px;
        outline: none;
    }

    input:hover {
        cursor: pointer;
        background-color: grey;
    }

    input[type='date']::-webkit-inner-spin-button:hover,
    input[type='date']::-webkit-calendar-picker-indicator:hover {
        cursor: pointer;
    }

    div.icon {
        width: 50px;
        line-height: 40px;
    }

    div.icon:hover {
        cursor: pointer;
        background-color: grey;
    }

    div.item {
        flex: 1;
        width: 100%;
    }

    div.item:hover {
        cursor: pointer;
        background-color: grey;
    }

    div.item.selected {
        font-weight: bolder;
        background: #fff;
        color: #3c3c3b;
    }
</style>
