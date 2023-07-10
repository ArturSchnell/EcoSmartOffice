<script context="module" lang="ts">
    /**
     * Resets the toast state, closing the toast and clearing its content.
     * @returns {void}
     */
    export const resetToast = (): void => {
        toastObject.update((obj) => ({ ...obj, isOpen: false, body: '', color: 'success' }));
    };

    /**
     * Sets a success message in the toast and displays it.
     * @param {string} msg the success message to be displayed
     * @returns {void}
     */
    export const setSuccessMessage = (msg: string): void => {
        toastObject.update((obj) => ({ ...obj, body: msg, color: 'success', isOpen: true }));
        setTimeout(() => {
            resetToast();
        }, 5000);
    };

    /**
     * Sets an error message in the toast and displays it.
     * @param {string} msg the error message to be displayed
     * @returns {void}
     */
    export const setErrorMessage = (msg: string): void => {
        toastObject.update((obj) => ({ ...obj, body: msg, color: 'danger', isOpen: true }));
        setTimeout(() => {
            resetToast();
        }, 5000);
    };
</script>

<script lang="ts">
    import { Alert } from 'sveltestrap';
    import { toastObject } from '../stores';
</script>

<div>
    <Alert
        color="{$toastObject.color}"
        isOpen="{$toastObject.isOpen}"
        toggle="{() => ($toastObject.isOpen = false)}"
        fade="{false}"
    >
        {$toastObject.body}
    </Alert>
</div>

<style>
    div {
        position: absolute;
        bottom: 30px;
        right: 70px;
        z-index: 2;
    }
</style>
