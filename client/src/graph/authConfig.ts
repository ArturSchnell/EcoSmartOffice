import { type AccountInfo, PublicClientApplication, LogLevel, InteractionRequiredAuthError, type AuthenticationResult, EventType, type EventPayload, type EventMessage, type PopupEvent } from '@azure/msal-browser';
import { isAdmin, isLoggedIn, tokenMSAL } from '../lib/scripts/stores';
import { get } from 'svelte/store';
import { getAuthDetails } from '../lib/scripts/ReqRes/auth';
let username = '';
const msalConfig = {
    auth: {
        // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
        // Full directory URL, in the form of https://login.microsoftonline.com/<tenant-id>
        authority: import.meta.env.VITE_MSAL_AUTHORITY,
        // Full redirect URL, in form of http://localhost:3000
        redirectUri: `${import.meta.env.VITE_MSAL_CLIENT_REDIRECT_ADDRESS || 'http://localhost'}:${import.meta.env.VITE_MSAL_CLIENT_REDIRECT_PORT || 80}`,
    },
    cache: {
        cacheLocation: 'sessionStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};
const myMSALObj = new PublicClientApplication(msalConfig);


function getTokenRedirect(request) {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);

    return myMSALObj.acquireTokenSilent(request)
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using redirect");
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenRedirect(request);
            } else {
                console.warn(error);
            }
        });
}

const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages"
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
    scopes: ["User.ReadBasic.All"],
    forceRefresh: false
};

//myMSALObj.loginRedirect(loginRequest);

const accounts = myMSALObj.getAllAccounts();
if (accounts.length > 0) {
    myMSALObj.setActiveAccount(accounts[0]);
}

myMSALObj.addEventCallback((event: {
    eventType: EventType;
    payload: EventPayload;
}) => {
    // Set active account after redirect
    if (
        event.eventType === EventType.LOGIN_SUCCESS &&
        event.payload?.account
    ) {
        const account: AccountInfo = event.payload.account as AccountInfo;
        myMSALObj.setActiveAccount(account);
    }
});

// handle auth redired/do all initial setup for msal
myMSALObj.handleRedirectPromise().then(authResult => {
    // Check if user signed in 
    const account = myMSALObj.getActiveAccount();
    if (!account) {
        // redirect anonymous user to login page 
        myMSALObj.loginRedirect();
    } else {
        getTokenRedirect(loginRequest)
            .then((response: AuthenticationResult) => {
                tokenMSAL.set(response.accessToken);
                return getAuthDetails(get(tokenMSAL));
            }).then(auth => {
                setAuth(auth)
            }).catch(error => {
                console.error(error);
            });
    }
}).catch(err => {
    console.error(err);
});

type Auth = {
    isAdmin: boolean,
    isLoggedIn: boolean
}

function setAuth(auth: Auth) {
    isLoggedIn.set(auth.isLoggedIn);
    isAdmin.set(auth.isAdmin);
}