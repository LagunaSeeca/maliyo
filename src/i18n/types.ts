export type Language = 'az' | 'ru' | 'en';

export interface Translations {
    // Common
    common: {
        loading: string;
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        add: string;
        search: string;
        noData: string;
        confirm: string;
        back: string;
        next: string;
        submit: string;
        close: string;
        yes: string;
        no: string;
        all: string;
        filter: string;
        export: string;
        import: string;
        download: string;
        upload: string;
        refresh: string;
        reset: string;
        viewAll: string;
        seeMore: string;
        showLess: string;
    };

    // Navigation
    nav: {
        dashboard: string;
        income: string;
        expenses: string;
        loans: string;
        payments: string;
        family: string;
        settings: string;
        logout: string;
    };

    // Auth
    auth: {
        login: string;
        register: string;
        email: string;
        password: string;
        confirmPassword: string;
        forgotPassword: string;
        resetPassword: string;
        signIn: string;
        signUp: string;
        createAccount: string;
        welcomeBack: string;
        signInToAccount: string;
        noAccount: string;
        haveAccount: string;
        enterEmail: string;
        enterPassword: string;
        fullName: string;
        loggingOut: string;
        sendOtp: string;
        verifyOtp: string;
        otpCode: string;
        resendCode: string;
        newPassword: string;
        passwordResetSuccess: string;
    };

    // Dashboard
    dashboard: {
        title: string;
        totalIncome: string;
        totalExpenses: string;
        netSavings: string;
        loanBalance: string;
        quickActions: string;
        addIncome: string;
        addExpense: string;
        addLoan: string;
        recentTransactions: string;
        expensesByCategory: string;
        monthlyPayments: string;
        markAsPaid: string;
        dueOn: string;
        lastPaid: string;
        neverPaid: string;
        noPaymentsScheduled: string;
        noRecentTransactions: string;
        vsLastPeriod: string;
        thisMonth: string;
        overDue: string;
    };

    // Income
    income: {
        title: string;
        addIncome: string;
        editIncome: string;
        amount: string;
        source: string;
        date: string;
        notes: string;
        recurring: string;
        sources: {
            salary: string;
            freelance: string;
            investment: string;
            rental: string;
            business: string;
            gift: string;
            other: string;
        };
    };

    // Expenses
    expenses: {
        title: string;
        addExpense: string;
        editExpense: string;
        amount: string;
        category: string;
        date: string;
        notes: string;
        recurring: string;
        categories: {
            food: string;
            transport: string;
            utilities: string;
            entertainment: string;
            shopping: string;
            health: string;
            education: string;
            travel: string;
            rent: string;
            insurance: string;
            subscriptions: string;
            other: string;
        };
    };

    // Loans
    loans: {
        title: string;
        addLoan: string;
        editLoan: string;
        loanName: string;
        amount: string;
        borrower: string;
        lender: string;
        interestRate: string;
        startDate: string;
        dueDate: string;
        status: string;
        notes: string;
        iGave: string;
        iTook: string;
        remaining: string;
        paid: string;
        pending: string;
        active: string;
        completed: string;
        overdue: string;
        recordPayment: string;
        paymentHistory: string;
        noLoans: string;
    };

    // Payments
    payments: {
        title: string;
        addPayment: string;
        editPayment: string;
        name: string;
        amount: string;
        dueDate: string;
        recurring: string;
        frequency: string;
        reminder: string;
        paid: string;
        unpaid: string;
        frequencies: {
            daily: string;
            weekly: string;
            monthly: string;
            yearly: string;
        };
        noPayments: string;
    };

    // Family
    family: {
        title: string;
        addMember: string;
        editMember: string;
        name: string;
        email: string;
        role: string;
        inviteMember: string;
        pendingInvites: string;
        familyMembers: string;
        noMembers: string;
        roles: {
            admin: string;
            member: string;
            viewer: string;
        };
        inviteSent: string;
        removeMember: string;
    };

    // Settings
    settings: {
        title: string;
        profile: string;
        appearance: string;
        notifications: string;
        security: string;
        language: string;
        theme: string;
        themes: {
            light: string;
            dark: string;
            system: string;
        };
        fullName: string;
        email: string;
        updateProfile: string;
        changePassword: string;
        currentPassword: string;
        newPassword: string;
        notificationSettings: string;
        emailNotifications: string;
        pushNotifications: string;
        paymentReminders: string;
        weeklyReports: string;
        profileUpdated: string;
        passwordChanged: string;
        currency: string;
        dateFormat: string;
    };

    // Languages
    languages: {
        az: string;
        ru: string;
        en: string;
        selectLanguage: string;
    };

    // Errors
    errors: {
        required: string;
        invalidEmail: string;
        passwordTooShort: string;
        passwordsDontMatch: string;
        somethingWentWrong: string;
        networkError: string;
        unauthorized: string;
        notFound: string;
        serverError: string;
        invalidCredentials: string;
        emailAlreadyExists: string;
    };

    // Success messages
    success: {
        saved: string;
        deleted: string;
        updated: string;
        created: string;
        copied: string;
    };

    // Confirmation dialogs
    confirm: {
        delete: string;
        deleteTitle: string;
        logout: string;
        logoutTitle: string;
        unsavedChanges: string;
    };

    // Time/Date
    time: {
        today: string;
        yesterday: string;
        thisWeek: string;
        thisMonth: string;
        thisYear: string;
        lastWeek: string;
        lastMonth: string;
        last3Months: string;
        lastYear: string;
        custom: string;
    };

    // Currency
    currency: {
        azn: string;
        usd: string;
        eur: string;
        rub: string;
    };
}
