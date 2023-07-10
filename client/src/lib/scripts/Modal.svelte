<script lang="ts">
    import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
    import { dateString, tokenMSAL, selectedFloor } from '../../lib/scripts/stores';
    import { get } from 'svelte/store';
    import { deleteTableReservation, patchTableReservation, putTableReservation } from './ReqRes/table';
    import type { TableC } from './Blueprint/Table.svelte';
    import { setDateDetails } from './SpaceSelection/SpaceSelectionCalendar.svelte';
    import { setErrorMessage, setSuccessMessage } from './Blueprint/Toast.svelte';
    import type { ReserveTableDetails } from './Types/types';

    let isModalOpen = false;

    /**
     * Retrieves the modal date string based on the current date string
     * @returns {string} the modal date string in the format 'DD.MM.YYYY'
     */
    const getModalDate = (): string => {
        const date = new Date(get(dateString));
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    export let table: TableC;
    let userPermanentWeekdays: number[];
    let generalPermanentWeekdays: number[];
    let weekday: number;

    let weekdays = {
        mo: {
            disabled: false,
            checked: false,
        },
        tu: {
            disabled: false,
            checked: false,
        },
        we: {
            disabled: false,
            checked: false,
        },
        th: {
            disabled: false,
            checked: false,
        },
        fr: {
            disabled: false,
            checked: false,
        },
        sa: {
            disabled: false,
            checked: false,
        },
        su: {
            disabled: false,
            checked: false,
        },
    };

    type ModalObject = {
        title: string;
        messageStandard: string;
        messageAlternative: string;
        permanent: boolean;
        weekdays: number[];
        showHidden: boolean;
        checkboxMessage: string;
        functions: {
            Accept: {
                text: string;
                function: () => void;
            };
            Cancel: {
                text: string;
                hide: boolean;
                function: () => void;
            };
        };
    };
    const modalObject: ModalObject = {
        title: '',
        messageStandard: '',
        messageAlternative: '',
        permanent: false,
        weekdays: [],
        showHidden: false,
        checkboxMessage: '',
        functions: {
            Accept: {
                text: '',
                function: () => {},
            },
            Cancel: {
                text: '',
                hide: false,
                function: () => {},
            },
        },
    };

    const reserveTableDetails: ReserveTableDetails = {
        tableId: table.tableId,
        reservedForDate: $dateString,
        floor: $selectedFloor,
        permanent: undefined,
    };

    /**
     * Sets the weekdays for reservation based on the current date string
     * @returns {void}
     */
    const setWeekdaysForReservation = (): void => {
        weekday = new Date($dateString).getDay();
        weekdays.mo.disabled = userPermanentWeekdays.includes(1) || generalPermanentWeekdays.includes(1);
        weekdays.tu.disabled = userPermanentWeekdays.includes(2) || generalPermanentWeekdays.includes(2);
        weekdays.we.disabled = userPermanentWeekdays.includes(3) || generalPermanentWeekdays.includes(3);
        weekdays.th.disabled = userPermanentWeekdays.includes(4) || generalPermanentWeekdays.includes(4);
        weekdays.fr.disabled = userPermanentWeekdays.includes(5) || generalPermanentWeekdays.includes(5);
        weekdays.sa.disabled = userPermanentWeekdays.includes(6) || generalPermanentWeekdays.includes(6);
        weekdays.su.disabled = userPermanentWeekdays.includes(0) || generalPermanentWeekdays.includes(0);
    };

    /**
     * Sets the weekdays for cancellation based on the current date string
     * @returns {void}
     */
    const setWeekdaysForCancellation = (): void => {
        weekday = new Date($dateString).getDay();
        weekdays.mo.disabled = !userPermanentWeekdays.includes(1) || !generalPermanentWeekdays.includes(1);
        weekdays.tu.disabled = !userPermanentWeekdays.includes(2) || !generalPermanentWeekdays.includes(2);
        weekdays.we.disabled = !userPermanentWeekdays.includes(3) || !generalPermanentWeekdays.includes(3);
        weekdays.th.disabled = !userPermanentWeekdays.includes(4) || !generalPermanentWeekdays.includes(4);
        weekdays.fr.disabled = !userPermanentWeekdays.includes(5) || !generalPermanentWeekdays.includes(5);
        weekdays.sa.disabled = !userPermanentWeekdays.includes(6) || !generalPermanentWeekdays.includes(6);
        weekdays.su.disabled = !userPermanentWeekdays.includes(0) || !generalPermanentWeekdays.includes(0);
    };

    /**
     * Resets the modal object properties to their default values
     * @returns {void}
     */
    const resetModal = (): void => {
        modalObject.showHidden = false;
        modalObject.permanent = false;
        modalObject.title = '';
        modalObject.messageStandard = '';
        modalObject.messageAlternative = '';
        modalObject.weekdays = [new Date($dateString).getDay()];
        modalObject.functions.Accept = {
            text: 'Ja',
            function: () => {},
        };
        modalObject.functions.Cancel = {
            text: 'Abbrechen',
            hide: false,
            function: () => {},
        };
    };

    /**
     * Sets the modal message for table in the past scenario
     * @returns {void}
     */
    const setTableInPastMessage = (): void => {
        modalObject.functions.Accept.text = 'Ok';
        modalObject.title = 'Datum liegt in der Vergangeheit';
        modalObject.messageStandard = `Dieser Tisch kann nicht zum <b>${getModalDate()}</b> gebucht werden, da das Datum in der Vergangenheit liegt.`;
        modalObject.functions.Cancel.hide = true;
    };

    /**
     * Sets the modal message for permanent reservation cancellation
     * @returns {void}
     */
    const setPermanentReservedMessage = (): void => {
        setWeekdaysForCancellation();
        modalObject.title = 'Tischreservierung zurückziehen?';
        modalObject.messageStandard = `Der Tisch ist bereits als Serie gebucht.<br>Soll die Reservierung für den <b>${getModalDate()}</b> storniert werden?`;
        modalObject.showHidden = true;
        modalObject.checkboxMessage = 'Zusätzlich Serienelemente stornieren für';
        modalObject.functions.Accept.function = () => {
            // async axios call for cancellation
            deleteTableReservation(reserveTableDetails, get(tokenMSAL))
                .then((res) => {
                    if (res) {
                        setSuccessMessage('Stornierung erfolgreich');
                        setDateDetails();
                        return;
                    }
                    throw Error;
                })
                .catch(() => {
                    setErrorMessage('Stornierung fehlgeschlagen');
                });
        };
    };

    /**
     * Sets the modal message for the scenario of canceling a table reservation for the same day
     * @returns {void}
     */
    const setSameTabelReservedForTodayMessage = (): void => {
        modalObject.title = 'Tischreservierung zurückziehen?';
        modalObject.messageStandard = `Der Tisch ist bereits für den <b>${getModalDate()}</b> gebucht.<br><br>Soll die Reservierung zurückgezogen werden?`;
        modalObject.functions.Accept.function = () => {
            // async axios call for cancellation
            deleteTableReservation(reserveTableDetails, get(tokenMSAL))
                .then((res) => {
                    if (res) {
                        setSuccessMessage('Stornierung erfolgreich');
                        setDateDetails();
                        return;
                    }
                    throw Error;
                })
                .catch(() => {
                    setErrorMessage('Stornierung fehlgeschlagen');
                });
        };
    };

    /**
     * Sets the modal message for the scenario of changing the table reservation for a specific day
     * @returns {void}
     */
    const setChangeTableForDayMessage = (): void => {
        modalObject.title = 'Tisch wechseln?';
        modalObject.messageStandard = `Es wurde bereits ein anderer Tisch für den <b>${getModalDate()}</b> gebucht.\n<br><br>Soll stattdessen dieser Tisch gebucht werden?`;
        modalObject.showHidden = false;
        modalObject.functions.Accept.function = () => {
            // async axios call for table change
            patchTableReservation(reserveTableDetails, get(tokenMSAL))
                .then((res) => {
                    if (res) {
                        setSuccessMessage('Wechsel erfolgreich');
                        setDateDetails();
                        return;
                    }
                    throw Error;
                })
                .catch(() => {
                    setErrorMessage('Wechsel fehlgeschlagen');
                });
        };
    };

    /**
     * Sets the modal message for the scenario of the table already being reserved by another person.
     * @returns {void}
     */
    const setTableAlreadyReservedMessage = (): void => {
        modalObject.functions.Accept.text = 'Ok';
        modalObject.title = 'Tisch wurde bereits gebucht';
        modalObject.messageStandard = `Dieser Tisch ist bereits von einer anderen Person zum <b>${getModalDate()}</b> gebucht.`;
        modalObject.functions.Cancel.hide = true;
    };

    /**
     * Sets the modal message for the scenario of making a table reservation
     * @returns {void}
     */
    const setReservableMessage = (): void => {
        setWeekdaysForReservation();
        modalObject.title = 'Tischreservierung';
        modalObject.messageStandard = `Soll der Tisch für den <b>${getModalDate()}</b> gebucht werden?`;
        modalObject.checkboxMessage = 'Zusätzlich Serienelemente buchen für';
        modalObject.showHidden = true;
        modalObject.functions.Accept.function = () => {
            // async axios call for new table reservation
            putTableReservation(reserveTableDetails, get(tokenMSAL))
                .then((res) => {
                    if (res) {
                        setSuccessMessage('Reservierung erfolgreich');
                        setDateDetails();
                        return;
                    }
                    throw Error;
                })
                .catch(() => {
                    setErrorMessage('Reservierung fehlgeschlagen');
                });
        };
    };

    /**
     * Checks if the selected date is in the past
     * @returns {boolean} true if the selected date is in the past, false otherwise
     */
    const isSelectedDateInPast = (): boolean => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const checkDate = new Date($dateString);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < currentDate;
    };

    /**
     * Sets the modal message based on the table details
     * @param {any} tableDetails the details of the table
     * @return {void}
     */
    export const setModalMessage = (tableDetails: any): void => {
        resetModal();
        reserveTableDetails.tableId = table.tableId;
        reserveTableDetails.reservedForDate = $dateString;
        reserveTableDetails.floor = $selectedFloor;
        userPermanentWeekdays = tableDetails.userPermanentWeekdays || [];
        generalPermanentWeekdays = tableDetails.generalPermanentWeekdays || [];
        isModalOpen = true;
        if (isSelectedDateInPast()) {
            setTableInPastMessage();
            return;
        }
        if (tableDetails.isSelectedTableReserved && !tableDetails.isTableReservedByMe) {
            setTableAlreadyReservedMessage();
            return;
        }
        if (tableDetails.hasUserAlreadyReservedTableToday) {
            if (tableDetails.isSameTable) {
                setSameTabelReservedForTodayMessage();

                if (tableDetails.isPermanent) {
                    setPermanentReservedMessage();
                    return;
                }
                return;
            }
            if (tableDetails.isSelectedTableReserved) {
                setReservableMessage();
                return;
            }
            setChangeTableForDayMessage();
            return;
        }

        setReservableMessage();
    };

    /**
     * toggle modal
     */
    const toggle = () => (isModalOpen = !isModalOpen);

    /**
     * Handles the change event of the checkbox.
     * @param {Event} event the event object.
     * @returns {void}
     */
    function handleCheckboxChange(event: Event): void {
        const checkboxValue = parseInt((event.target as HTMLInputElement).value);

        if ((event.target as HTMLInputElement).checked) {
            modalObject.weekdays = [...modalObject.weekdays, checkboxValue];
        } else {
            modalObject.weekdays = modalObject.weekdays.filter((checkbox) => checkbox !== checkboxValue);
        }

        reserveTableDetails.permanent = modalObject.permanent ? { weekdays: modalObject.weekdays } : undefined;
    }

    /**
     * Handles the change event of the permanent checkbox
     * @returns {void}
     */
    function handleCheckboxPermanent(): void {
        reserveTableDetails.permanent = modalObject.permanent ? { weekdays: modalObject.weekdays } : undefined;
        if (modalObject.permanent) {
            modalObject.functions.Accept.text = 'Abschicken';
        } else {
            modalObject.functions.Accept.text = 'Ja';
        }
    }
</script>

{#if isModalOpen}
    <Modal isOpen="{isModalOpen}" toggle="{toggle}">
        <ModalHeader toggle="{toggle}">{modalObject.title}</ModalHeader>
        <ModalBody>
            {@html modalObject.messageStandard}
        </ModalBody>
        {#if modalObject.functions.Accept || modalObject.functions.Cancel}
            {#if modalObject.showHidden === true}
                <ModalFooter class="left">
                    <input
                        type="checkbox"
                        name="permanent"
                        id="permanent"
                        bind:checked="{modalObject.permanent}"
                        on:change="{handleCheckboxPermanent}"
                    />
                    <label for="permanent"> {modalObject.checkboxMessage}</label>
                    {#if modalObject.permanent}
                        <div>
                            <span
                                ><input
                                    name="mo"
                                    id="mo"
                                    type="checkbox"
                                    value="1"
                                    disabled="{weekdays.mo.disabled || weekday === 1}"
                                    checked="{weekday === 1}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="mo">Mo</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="tu"
                                    id="tu"
                                    type="checkbox"
                                    value="2"
                                    disabled="{weekdays.tu.disabled || weekday === 2}"
                                    checked="{weekday === 2}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="tu">Di</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="we"
                                    id="we"
                                    type="checkbox"
                                    value="3"
                                    disabled="{weekdays.we.disabled || weekday === 3}"
                                    checked="{weekday === 3}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="we">Mi</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="th"
                                    id="th"
                                    type="checkbox"
                                    value="4"
                                    disabled="{weekdays.th.disabled || weekday === 4}"
                                    checked="{weekday === 4}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="th">Do</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="fr"
                                    id="fr"
                                    type="checkbox"
                                    value="5"
                                    disabled="{weekdays.fr.disabled || weekday === 5}"
                                    checked="{weekday === 5}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="fr">Fr</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="sa"
                                    id="sa"
                                    type="checkbox"
                                    value="6"
                                    disabled="{weekdays.sa.disabled || weekday === 6}"
                                    checked="{weekday === 6}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="sa">Sa</label></span
                            ><br class="mobile-break" />
                            <span
                                ><input
                                    name="su"
                                    id="su"
                                    type="checkbox"
                                    value="0"
                                    disabled="{weekdays.su.disabled || weekday === 0}"
                                    checked="{weekday === 0}"
                                    on:change="{handleCheckboxChange}"
                                />
                                <label for="su">So</label></span
                            >
                        </div>
                    {/if}
                </ModalFooter>
            {/if}
            <ModalFooter>
                <Button
                    class="primary"
                    disabled="{modalObject.permanent && modalObject.weekdays.length === 0}"
                    on:click="{() => {
                        modalObject.functions.Accept.function();
                        toggle();
                    }}">{modalObject.functions.Accept.text}</Button
                >
                {#if !modalObject.functions.Cancel.hide}
                    <Button
                        color="secondary"
                        on:click="{() => {
                            modalObject.functions.Cancel.function();
                            toggle();
                        }}">{modalObject.functions.Cancel.text}</Button
                    >
                {/if}
            </ModalFooter>
        {/if}
    </Modal>
{/if}

<style>
    :global(.modal-footer.left) {
        display: block;
    }

    :global(.modal-footer .primary) {
        background: #ef7d00;
        border: 1px solid #ef7d00;
    }
    span {
        padding-right: 20px;
    }

    @media screen and (min-width: 600px) {
        .mobile-break {
            display: none;
        }
    }
</style>
