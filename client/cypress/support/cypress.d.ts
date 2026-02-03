// Type declarations for Cypress when package is not fully installed
declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
         * Custom command to select DOM element by data-testid attribute.
         * @example cy.getByTestId('login-button')
         */
        getByTestId(value: string): Chainable<JQuery<HTMLElement>>;

        /**
         * Custom command to login with email and password
         */
        login(email: string, password: string): Chainable<void>;

        /**
         * Custom command to login as a trader
         */
        loginAsTrader(): Chainable<void>;

        /**
         * Custom command to login as an admin
         */
        loginAsAdmin(): Chainable<void>;

        /**
         * Custom command to logout
         */
        logout(): Chainable<void>;

        /**
         * Custom command to fill a form with data
         */
        fillForm(formData: Record<string, string>): Chainable<void>;
    }
}

declare const cy: Cypress.cy & CyEventEmitter;
declare const describe: Mocha.SuiteFunction;
declare const it: Mocha.TestFunction;
declare const before: Mocha.HookFunction;
declare const beforeEach: Mocha.HookFunction;
declare const after: Mocha.HookFunction;
declare const afterEach: Mocha.HookFunction;
declare const context: Mocha.SuiteFunction;
declare const expect: Chai.ExpectStatic;

interface CyEventEmitter {
    visit(url: string, options?: Partial<Cypress.VisitOptions>): Cypress.Chainable<Cypress.AUTWindow>;
    get(selector: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>): Cypress.Chainable<JQuery<HTMLElement>>;
    contains(content: string | number | RegExp): Cypress.Chainable<JQuery<HTMLElement>>;
    contains(selector: string, content: string | number | RegExp): Cypress.Chainable<JQuery<HTMLElement>>;
    click(options?: Partial<Cypress.ClickOptions>): Cypress.Chainable<any>;
    type(text: string, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<any>;
    clear(options?: Partial<Cypress.ClearOptions>): Cypress.Chainable<any>;
    check(options?: Partial<Cypress.CheckOptions>): Cypress.Chainable<any>;
    uncheck(options?: Partial<Cypress.CheckOptions>): Cypress.Chainable<any>;
    select(valueOrTextOrIndex: string | number | string[], options?: Partial<Cypress.SelectOptions>): Cypress.Chainable<any>;
    submit(options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): Cypress.Chainable<any>;
    url(options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): Cypress.Chainable<string>;
    wait(ms: number): Cypress.Chainable<undefined>;
    wait(alias: string, options?: Partial<Cypress.Timeoutable & Cypress.Withinable & Cypress.Loggable>): Cypress.Chainable<any>;
    intercept(url: string | RegExp, response?: any): Cypress.Chainable<null>;
    intercept(method: string, url: string | RegExp, response?: any): Cypress.Chainable<null>;
    intercept(routeMatcher: any, response?: any): Cypress.Chainable<null>;
    should(chainers: string, value?: any): Cypress.Chainable<any>;
    should(chainers: string, method: string, value: any): Cypress.Chainable<any>;
    should(fn: (currentSubject: any) => void): Cypress.Chainable<any>;
    clearCookies(options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): Cypress.Chainable<null>;
    clearLocalStorage(key?: string | RegExp): Cypress.Chainable<null>;
    fixture(path: string): Cypress.Chainable<any>;
    invoke(functionName: string, ...args: any[]): Cypress.Chainable<any>;
    then(fn: (subject: any) => any): Cypress.Chainable<any>;
    within(fn: () => void): Cypress.Chainable<any>;
    find(selector: string): Cypress.Chainable<JQuery<HTMLElement>>;
    first(): Cypress.Chainable<JQuery<HTMLElement>>;
    last(): Cypress.Chainable<JQuery<HTMLElement>>;
    eq(index: number): Cypress.Chainable<JQuery<HTMLElement>>;
}
