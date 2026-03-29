export default {
  settings: {
    pageTitle: 'Settings',
    pageSubtitle: 'System Configuration & User Management',
    tabs: {
      system: 'System Settings',
      users: 'Users & Permissions',
      audit: 'Audit Logs'
    },
    system: {
      messages: {
        saveSuccess: 'Saved successfully',
        error: 'An error occurred while saving'
      },
      title: 'Company & Tax Profile',
      description: 'This information will appear on printed invoices and tax returns.',
      fields: {
        restaurantName: 'Restaurant Name (Official)',
        crNumber: 'CR Number',
        taxNumber: 'VAT Number',
        vatRate: 'VAT Rate (%)'
      },
      buttons: {
        saving: 'Saving...',
        save: 'Save Settings'
      }
    },
    users: {
      messages: {
        createSuccess: 'User added successfully',
        error: 'An error occurred'
      },
      roles: {
        admin: 'System Admin',
        accountant: 'Accountant',
        cashier: 'Cashier'
      },
      status: {
        active: 'Active',
        inactive: 'Inactive'
      },
      section1: 'New User Details',
      fields: {
        fullName: 'Full Name',
        username: 'Username (Login)',
        email: 'Email',
        password: 'Password',
        role: 'Role'
      },
      buttons: {
        cancel: 'Cancel',
        saving: 'Saving...',
        save: '💾 Add User',
        newUser: 'New User'
      },
      table: {
        title: 'Users List',
        fullName: 'Full Name',
        username: 'Login Name',
        email: 'Email',
        role: 'Role',
        status: 'Status'
      }
    },
    audit: {
      title: 'System Audit Logs',
      table: {
        datetime: 'Date & Time',
        user: 'User',
        action: 'Action',
        table: 'Table',
        details: 'Details (JSON)'
      },
      showDetails: 'Show Details'
    }
  },
  trialBalance: {
    exportTitle: 'Trial_Balance',
    pageTitle: 'Trial Balance',
    pageSubtitle: 'Account balances report',
    filter: {
      update: 'Update'
    },
    table: {
      accountCode: 'Account Code',
      accountName: 'Account Name',
      type: 'Type',
      totalDebit: 'Total Debit',
      totalCredit: 'Total Credit',
      balance: 'Balance',
      total: 'Total',
      export: 'Export Excel'
    },
    status: {
      balanced: '✓ Balance is valid',
      unbalanced: '✗ Balance is invalid'
    }
  },
  ledger: {
    exportTitle: 'General_Ledger',
    pageTitle: 'General Ledger',
    pageSubtitle: 'Detailed account transactions',
    filter: {
      accountCode: 'Account Code (Optional)',
      codePlaceholder: 'e.g. 1101',
      from: 'From',
      to: 'To',
      search: 'Search'
    },
    table: {
      date: 'Date',
      entryNumber: 'Entry No.',
      description: 'Description',
      account: 'Account',
      debit: 'Debit',
      credit: 'Credit',
      balance: 'Balance',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  performance: {
    pageTitle: 'Financial Performance',
    pageSubtitle: 'Analysis of sales, expenses, and profits over the specified period',
    filter: {
      from: 'From',
      to: 'To'
    },
    kpi: {
      totalRevenue: 'Total Revenue',
      totalExpenses: 'Total Expenses (Including COGS)',
      netProfit: 'Net Profit',
      margin: 'Margin:'
    },
    chart: {
      title: 'Financial Performance Over Time',
      revenue: 'Revenue',
      expenses: 'Expenses',
      profit: 'Net Profit'
    }
  },
  incomeStatement: {
    exportTitle: 'Income_Statement',
    pageTitle: 'Income Statement',
    pageSubtitle: 'Profit and Loss Report',
    filter: {
      from: 'From',
      to: 'To',
      update: 'Update'
    },
    table: {
      item: 'Item',
      amount: 'Amount (SAR)',
      percentage: '%',
      export: 'Export Excel'
    },
    items: {
      revenuesHeader: 'Revenues',
      deliveryRevenue: 'Delivery Revenue',
      restaurantRevenue: 'Restaurant Revenue',
      subscriptionsRevenue: 'Subscriptions Revenue',
      totalRevenue: 'Total Revenue',
      cogsHeader: 'Cost of Goods Sold (COGS)',
      purchases: 'Purchases',
      grossProfit: 'Gross Profit',
      expensesHeader: 'Operating Expenses',
      totalExpenses: 'Total Expenses',
      netProfit: 'Net Profit',
      cogsFull: 'Cost of Goods Sold (Purchases)'
    }
  },
  journal: {
    messages: {
      createSuccess: 'Journal entry saved successfully',
      reverseSuccess: 'Entry reversed successfully',
      error: 'An error occurred'
    },
    sourceTypes: {
      purchase: 'Purchases',
      revenue: 'Revenue',
      expense: 'Expenses',
      reversal: 'Reversal',
      manual: 'Manual'
    },
    exportTitle: 'Journal_Entries',
    pageTitle: 'Journal Entries',
    pageSubtitle: 'Double-entry accounting records',
    newEntry: 'New Entry',
    section1: 'Entry Details',
    section2: 'Entry Lines',
    fields: {
      date: 'Date',
      description: 'Description',
      reference: 'Reference',
      account: 'Account',
      debit: 'Debit',
      credit: 'Credit',
      selectAccount: 'Select Account'
    },
    buttons: {
      addLine: 'Add Line',
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Entry',
      reverse: 'Reverse'
    },
    balance: {
      balanced: 'Entry is balanced ✓',
      unbalanced: 'Entry is unbalanced — Difference:',
      currency: 'SAR',
      totalDebit: 'Total Debit:',
      totalCredit: 'Total Credit:'
    },
    table: {
      entryNumber: 'Entry No.',
      date: 'Date',
      description: 'Description',
      source: 'Source',
      reference: 'Reference',
      amount: 'Amount',
      isBalanced: 'Balanced',
      status: 'Status',
      reverse: 'Reverse',
      yes: 'Yes',
      no: 'No',
      reversed: 'Reversed',
      active: 'Active',
      export: 'Export Excel',
      empty: 'No entries found'
    },
    dialogs: {
      reverseTitle: 'Reverse Entry',
      reverseMessage: 'A reversing entry will be created to cancel the effect of this entry. This action cannot be undone.',
      manualReverseReason: 'Manual reversal'
    }
  },
  accounts: {
    types: {
      asset: 'Assets',
      liability: 'Liabilities',
      equity: 'Equity',
      revenue: 'Revenue',
      expense: 'Expenses'
    },
    messages: {
      createSuccess: 'Account added successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Chart_of_Accounts',
    pageTitle: 'Chart of Accounts',
    accountCount: 'accounts',
    newAccount: 'New Account',
    section1: 'New Account Details',
    fields: {
      code: 'Code',
      nameAr: 'Name (Arabic)',
      nameEn: 'Name (English)',
      accountType: 'Account Type',
      parentCode: 'Parent Account Code',
      parentCodePlaceholder: 'Optional',
      level: 'Level'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Account'
    },
    table: {
      code: 'Code',
      nameAr: 'Account Name (Ar)',
      nameEn: 'Account Name (En)',
      level: 'Level',
      isSystem: 'System',
      yes: 'Yes',
      no: 'No',
      export: 'Export Excel'
    }
  },
  production: {
    messages: {
      createSuccess: 'Production recorded successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Production_Log',
    pageTitle: 'Production & Waste',
    pageSubtitle: 'Daily production and waste tracking',
    newProduction: 'Record Production',
    section1: 'Production Summary',
    fields: {
      date: 'Date',
      productName: 'Product Name',
      producedKg: 'Production (kg)',
      wasteGrams: 'Waste (grams)',
      wasteValue: 'Waste Value (SAR)',
      unitCost: 'Unit Cost/kg'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save'
    },
    table: {
      date: 'Date',
      product: 'Product',
      productionKg: 'Production (kg)',
      wasteGrams: 'Waste (g)',
      wasteValue: 'Waste Value',
      wastePct: 'Waste %',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  subscribers: {
    validation: {
      nameRequired: 'Name is required',
      amountRequired: 'Amount is required',
      startDateRequired: 'Start date is required',
      endDateRequired: 'End date is required'
    },
    status: {
      active: 'Active',
      expired: 'Expired',
      cancelled: 'Cancelled'
    },
    messages: {
      createSuccess: 'Subscriber added successfully',
      renewSuccess: 'Subscription renewed and revenue entry generated automatically',
      error: 'An error occurred'
    },
    exportTitle: 'Subscriptions',
    pageTitle: 'Subscriptions Tracking',
    pageSubtitle: 'Manage subscribers and renewals',
    newSubscriber: 'New Subscriber',
    alerts: {
      expiringSubscribers: 'subscribers',
      expiringSoon: 'subscriptions expire within 7 days'
    },
    kpi: {
      active: 'Active Subscribers',
      expired: 'Expired Subscriptions',
      mrr: 'Monthly Recurring Revenue (MRR)'
    },
    section1: 'Subscriber Details',
    fields: {
      name: 'Subscriber Name',
      phone: 'Phone Number',
      planName: 'Plan Name',
      planAmount: 'Subscription Value (SAR)',
      startDate: 'Start Date',
      endDate: 'End Date',
      paymentMethod: 'Payment Method',
      notes: 'Notes'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Subscriber',
      renew: 'Renew',
      renewTitle: 'Renew Subscription'
    },
    tabs: {
      all: 'All',
      active: 'Active',
      expired: 'Expired',
      cancelled: 'Cancelled'
    },
    table: {
      subscriber: 'Subscriber',
      phone: 'Phone',
      plan: 'Plan',
      endDate: 'End Date',
      amount: 'Amount',
      status: 'Status',
      action: 'Action',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  suppliers: {
    validation: {
      nameArRequired: 'Arabic name is required'
    },
    messages: {
      createSuccess: 'Supplier added successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Suppliers',
    pageTitle: 'Suppliers',
    pageSubtitle: 'Manage supplier data and VAT numbers',
    newSupplier: 'New Supplier',
    section1: 'Supplier Details',
    fields: {
      nameAr: 'Arabic Name',
      nameEn: 'English Name',
      vatNumber: 'VAT Number',
      vatHelper: 'Leave empty if the supplier is tax-exempt',
      hasVat: 'Is the supplier registered for VAT?',
      category: 'Category',
      selectCategory: 'Select Category',
      phone: 'Phone',
      email: 'Email'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Supplier'
    },
    table: {
      name: 'Supplier Name',
      category: 'Category',
      vatNumber: 'VAT Number',
      phone: 'Phone',
      vatStatus: 'VAT Status',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      registered: 'Registered',
      exempt: 'Exempt',
      export: 'Export Excel',
      empty: 'No suppliers found'
    },
    ledger: {
      title: 'Supplier Ledger:',
      subtitle: 'Track invoices, payments, and outstanding balance',
      totalInvoices: 'Total Invoices',
      totalVat: 'Total VAT (Purchases)',
      outstandingBalance: 'Outstanding Balance (Credit)',
      invoicesLog: 'Invoices Log',
      table: {
        invoiceNumber: 'Invoice Number',
        date: 'Date',
        description: 'Description',
        paymentMethod: 'Payment Method',
        subtotal: 'Subtotal before VAT',
        vat: 'VAT',
        total: 'Total'
      }
    }
  },
  pettyCash: {
    messages: {
      createSuccess: 'Petty cash saved successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Petty_Cash',
    pageTitle: 'Petty Cash',
    pageSubtitle: 'Daily cash tracking and reconciliation',
    newEntry: 'Daily Entry',
    reconciliation: {
      today: 'Today\'s Reconciliation — ',
      openingBalance: 'Opening Balance',
      replenishment: 'Cashier Replenishment',
      expected: 'Expected Balance',
      variance: 'Variance'
    },
    section1: 'Daily Cash Details',
    fields: {
      date: 'Date',
      openingBalance: 'Opening Balance',
      replenishment: 'Cashier Replenishment',
      cashPurchases: 'Cash Purchases',
      cardPurchases: 'Card Purchases',
      expectedBalance: 'Expected Balance',
      closingBalance: 'Actual Closing Balance'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save'
    },
    table: {
      date: 'Date',
      opening: 'Opening',
      replenishment: 'Replenishment',
      purchases: 'Purchases',
      closing: 'Closing',
      variance: 'Variance',
      status: 'Status',
      balanced: 'Balanced',
      unbalanced: 'Variance Found',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  expenses: {
    messages: {
      createSuccess: 'Expense saved successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Expenses',
    pageTitle: 'Enter Expenses',
    pageSubtitle: 'Register operational expenses with accounting entry',
    newExpense: 'New Expense',
    section1: 'Expense Details',
    fields: {
      date: 'Date',
      account: 'Account',
      expenseType: 'Expense Type',
      paymentMethod: 'Payment Method',
      description: 'Description',
      amount: 'Amount',
      includesVat: 'Includes 15% VAT',
      vat: 'VAT',
      total: 'Total'
    },
    types: {
      fixed: 'Fixed',
      variable: 'Variable',
      operational: 'Operational',
      emergency: 'Emergency'
    },
    accounts: {
      a5201: 'Salaries and Wages',
      a5202: 'Rent',
      a5203: 'Electricity and Water',
      a5204: 'Maintenance',
      a5205: 'Marketing and Advertising',
      a5206: 'Transportation',
      a5207: 'Communications and Internet',
      a5208: 'Administrative Expenses',
      a5209: 'Miscellaneous Expenses',
      a5210: 'Damaged and Waste'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Expense'
    },
    table: {
      date: 'Date',
      description: 'Description',
      type: 'Type',
      paymentMethod: 'Payment Method',
      amount: 'Amount',
      vat: 'VAT',
      total: 'Total',
      empty: 'No data found'
    }
  },
  subscriptions: {
    messages: {
      createSuccess: 'Subscriptions revenue saved successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Subscriptions_Revenue',
    pageTitle: 'Subscriptions Revenue',
    pageSubtitle: 'Monthly subscriber payments',
    newRevenue: 'Add Revenue',
    kpi: {
      totalRevenue: 'Total Subscriptions Revenue'
    },
    fields: {
      amount: 'Amount (SAR)',
      paymentMethod: 'Payment Method',
      notes: 'Notes'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save'
    },
    table: {
      date: 'Date',
      amount: 'Amount',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  restaurant: {
    messages: {
      createSuccess: 'Restaurant revenue saved successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Restaurant_Revenue',
    pageTitle: 'Restaurant Revenue',
    pageSubtitle: 'Daily in-house sales',
    newRevenue: 'Add Revenue',
    kpi: {
      totalRevenue: 'Total Restaurant Revenue'
    },
    section1: 'Revenue Details',
    fields: {
      amount: 'Amount (SAR)',
      coversCount: 'Covers Count',
      paymentMethod: 'Payment Method',
      notes: 'Notes'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save'
    },
    table: {
      date: 'Date',
      amount: 'Amount',
      covers: 'Covers',
      export: 'Export Excel',
      empty: 'No data found'
    }
  },
  delivery: {
    validation: {
      dateRequired: 'Date is required',
      grossPositive: 'Amount must be greater than zero'
    },
    messages: {
      createSuccess: 'Delivery revenue saved successfully',
      error: 'An error occurred'
    },
    exportTitle: 'Delivery_Revenue',
    pageTitle: 'Delivery Revenue',
    newRevenue: 'Add Revenue',
    kpi: {
      gross: 'Total Revenue',
      commissions: 'Commissions',
      net: 'Net Revenue'
    },
    section1: 'Revenue Details',
    fields: {
      paymentMethod: 'Payment Method',
      grossAmount: 'Gross Amount',
      commissionRate: 'Commission Rate',
      notes: 'Notes',
      commissionAmount: 'Commission Amount',
      netAmount: 'Net Amount'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Revenue'
    },
    table: {
      title: 'Revenue Record',
      export: 'Export Excel',
      date: 'Date',
      platform: 'Platform',
      gross: 'Gross',
      commission: 'Commission',
      net: 'Net',
      empty: 'No data found'
    }
  },
  purchases: {
    validation: {
      supplierRequired: 'Supplier must be selected'
    },
    categories: {
      'مواد غذائية': 'Food Items',
      'خضار': 'Vegetables',
      'بلاستيكيات': 'Plastics',
      'مشروبات': 'Drinks',
      'خبز': 'Bread',
      'معدات مطبخ': 'Kitchen Equipment',
      'مياه': 'Water'
    },
    paymentMethods: {
      cash: 'Cash',
      bank: 'Bank',
      credit: 'Credit'
    },
    messages: {
      createSuccess: 'Invoice saved and journal entry generated automatically',
      deleteSuccess: 'Invoice deleted and journal entry reversed',
      error: 'An error occurred'
    },
    exportTitle: 'Purchases',
    exportCols: {
      invoiceNumber: 'Invoice Number',
      date: 'Date',
      supplier: 'Supplier',
      item: 'Item',
      category: 'Category',
      qty: 'Quantity',
      price: 'Price',
      paymentMethod: 'Payment Method',
      subtotal: 'Subtotal before Tax',
      vat: 'VAT',
      total: 'Total'
    },
    pageTitle: 'Enter Purchases',
    pageSubtitle: 'Register supplier invoices with automatic accounting entry',
    newInvoice: 'New Invoice',
    section1: 'Invoice Details',
    fields: {
      invoiceNumber: 'Invoice Number',
      date: 'Invoice Date',
      supplier: 'Supplier',
      selectSupplier: 'Select Supplier',
      category: 'Category',
      item: 'Item Name',
      qty: 'Quantity',
      price: 'Unit Price',
      discount: 'Discount',
      subtotal: 'Subtotal before Tax',
      vat: 'VAT 15%',
      exempt: '(Exempt)',
      total: 'Total',
      paymentMethod: 'Payment Method',
      isAsset: 'Fixed Asset (Equipment / Furniture)'
    },
    section2: 'Quantities and Prices',
    section3: 'Payment Method',
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Invoice'
    },
    table: {
      title: 'Invoice Record',
      export: 'Export Excel',
      empty: 'No invoices found'
    },
    delete: {
      title: 'Delete Invoice',
      message: 'The invoice will be deleted and its accounting entry reversed automatically. This action cannot be undone.',
      aria: 'Delete Invoice'
    }
  },
  fixedAssets: {
    messages: {
      createSuccess: 'Asset created successfully',
      deleteSuccess: 'Asset deleted successfully',
      depreciateSuccess: 'Depreciation journal calculated and posted successfully',
      error: 'An unexpected error occurred'
    },
    exportTitle: 'Fixed_Assets_Register',
    pageTitle: 'Manage Fixed Assets',
    pageSubtitle: 'Create, track, and depreciate fixed assets',
    newAsset: 'New Asset',
    kpi: {
      totalCost: 'Total Original Cost',
      totalDepreciation: 'Total Accumulated Depreciation',
      netBookValue: 'Net Book Value',
      totalVat: 'Total VAT',
      totalAssets: 'Total Assets'
    },
    section1: 'Basic Asset Details',
    section2: 'Financial & Depreciation Data',
    fields: {
      date: 'Purchase Date',
      assetName: 'Asset Name',
      assetType: 'Asset Type',
      selectType: 'Select Asset Type',
      cost: 'Total Cost (Including VAT if applicable)',
      includesVat: 'Includes 15% VAT',
      vat: 'VAT (15%)',
      paymentMethod: 'Payment Method',
      usefulLife: 'Useful Life (Years)',
      description: 'Description or Model',
      notes: 'Additional Notes'
    },
    types: {
      equipment: 'Equipment',
      furniture: 'Furniture',
      vehicles: 'Vehicles',
      technology: 'Technology',
      other: 'Other Assets'
    },
    buttons: {
      cancel: 'Cancel',
      saving: 'Saving...',
      save: '💾 Save Asset',
      depreciate: 'Run Accumulated Depreciation'
    },
    table: {
      title: 'Assets Register',
      export: 'Export Excel',
      empty: 'No assets found',
      date: 'Date',
      asset: 'Asset',
      name: 'Asset Name',
      account: 'Account',
      usefulLife: 'Useful Life',
      type: 'Type',
      cost: 'Cost',
      vat: 'VAT',
      depreciation: 'Accumulated Depreciation',
      netValue: 'Net Book Value'
    },
    delete: {
      title: 'Delete Asset',
      message: 'This will delete the asset and reverse related journal entries. Are you sure?',
      aria: 'Delete Asset'
    }
  },
  auth: {
    invalidEmail: 'Invalid email address',
    passwordRequired: 'Password is required',
    welcome: 'Welcome,',
    loginError: 'Login failed',
    subtitle: 'Restaurant Management System',
    email: 'Email',
    password: 'Password',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    loggingIn: 'Logging in...',
    login: 'Login',
    loginTitle: 'Welcome back 👋',
    loginSubtitle: 'Sign in to your account',
    emailPlaceholder: 'admin@mrsehi.sa',
  },
  dashboard: {
    financialStory: 'Financial Story',
    totalRevenue: 'Total Revenue',
    thisMonthUp: 'Up this month',
    revenueSources: 'Main Revenue Sources',
    netProfit: 'Net Profit',
    totalExpenses: 'Total Expenses',
    activeSubscribers: 'Active Subscribers',
    expiringSoon: 'expiring soon',
    notExpiringSoon: 'No subscriptions expiring soon',
    vat: 'VAT',
    pettyCash: 'Petty Cash',
    todayBalance: 'Today\'s Balance',
    revenueChannels: 'Revenue Channels',
    channels: {
      keeta: 'Keeta',
      hunger: 'Hungerstation',
      ninja: 'Ninja',
      resto: 'Restaurant',
      subs: 'Subscriptions'
    },
    performanceAnalysis: 'Performance Analysis',
    revenueVsExpenses: 'Revenue vs Expenses',
    last6Days: 'Last 6 Days',
    revenue: 'Revenue',
    expenses: 'Expenses',
    expensesDistribution: 'Expenses Distribution',
    thisMonth: 'This Month',
    recentTransactions: 'Recent Transactions',
    purchaseInvoices: 'Purchase Invoices',
    expensesLabels: ['Salaries', 'Rent', 'Raw Materials', 'Marketing', 'Utilities'],
    last8Invoices: 'Last 8 registered invoices',
    newInvoice: 'New Invoice',
    tableHeaders: ['Invoice No.', 'Supplier', 'Date', 'Subtotal', 'VAT 15%', 'Total', 'Payment', 'Actions'],
    noInvoices: 'No invoices registered',
    vatSummary: 'VAT Summary',
    inProgress: 'In Progress',
    totalTaxableSales: 'Total Taxable Sales',
    salesVat: 'Sales VAT (15%)',
    purchasesVat: 'Paid Purchases VAT',
    netVatPayable: 'Net VAT Payable',
    profitMargins: 'Profit Margins',
    grossMargin: 'Gross<br/>Margin',
    operatingMargin: 'Operating<br/>Margin',
    netMargin: 'Net<br/>Margin',
    quickInsights: 'Quick Insights',
    topRevenueChannel: 'Top Revenue Channel',
    delivery: 'Delivery',
    restaurant: 'Restaurant',
    subscriptions: 'Subscriptions',
    deliveryRevenue: 'Delivery Revenue',
    expiringSubscriptions: 'Expiring Subscriptions',
    subscribers: 'subscribers',
    subscriber: 'subscriber',
    nextTaxQuarter: 'Next Tax Quarter',
    vatPayable: 'VAT Payable',
    welcome: 'Welcome',
    lastUpdate: 'Last Update:',
    profitMargin: 'Profit Margin',
    recentTransactionsTitle: 'Recent Transactions in System',
    transactionType: 'Transaction Type',
    transactionAmount: 'Amount',
    transactionDate: 'Date',
    noRecentTransactions: 'No recent transactions'
  },
  pages: {
    dashboard: 'Dashboard',
    delivery: 'Delivery Revenue',
    restaurant: 'Restaurant Revenue',
    subscriptions: 'Subscriptions Revenue',
    purchases: 'Purchases',
    expenses: 'Expenses',
    pettyCash: 'Petty Cash',
    suppliers: 'Suppliers',
    subscribers: 'Subscribers',
    production: 'Production & Waste',
    accounts: 'Chart of Accounts',
    journal: 'Journal Entries',
    ledger: 'General Ledger',
    trialBalance: 'Trial Balance',
    incomeStatement: 'Income Statement',
    performance: 'Financial Analysis',
    reports: 'Reports',
    fixedAssets: 'Fixed Assets',
    balanceSheet: 'Balance Sheet',
    cashFlow: 'Cash Flow Statement',
    channelAnalysis: 'Channel Analysis',
    wasteAnalysis: 'Waste Analysis',
    breakeven: 'Break-Even',
    vatSummary: 'VAT Summary',
    auditLog: 'Audit Log',
    users: 'User Management'
  },
  layout: {
    settings: 'Settings',
    title: 'Mr. Sehi',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    notifications: 'Notifications',
    logout: 'Logout',
    profile: 'Profile'
  },
  sidebar: {
    systemName: 'Financial Management System',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    revenue: 'Revenue',
    expenses: 'Expenses & Purchases',
    management: 'Management & Operations',
    accounting: 'Finance & Accounting',
    analysis: 'Analysis & Reports',
    administration: 'Administration',
    roles: {
      admin: 'System Admin',
      accountant: 'Accountant',
      cashier: 'Cashier'
    }
  },
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    error: 'Error occurred',
    success: 'Success',
    updateSuccess: 'Updated successfully',
    confirm: 'Confirm',
    back: 'Back',
    search: 'Search...',
    apply: 'Apply',
    filter: 'Filter',
    all: 'All',
    refresh: 'Refresh',
    noData: 'No data found',
    exportPdf: 'Export PDF',
    exportExcel: 'Export Excel',
    next: 'Next',
    prev: 'Prev',
    status: 'Status'
  },
  dateRange: {
    today: 'Today',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    selectRange: 'Select Range',
    from: 'From',
    to: 'To'
  },
  cashFlow: {
    operating: 'Operating Activities',
    investing: 'Investing Activities',
    financing: 'Financing Activities',
    netChange: 'Net Cash Change',
    dailyFlow: 'Daily Cash Flow',
    exportTitle: 'Cash_Flow_Statement'
  },
  breakeven: {
    aboveBreakeven: 'Above Break-Even ✓',
    belowBreakeven: 'Below Break-Even ✗',
    profitableDesc: 'The restaurant is profitable in this period',
    lossDesc: 'Revenue has not yet covered fixed costs',
    currentRevenue: 'Current Revenue',
    breakevenSales: 'Break-Even Sales',
    fixedCosts: 'Fixed Costs',
    safetyMargin: 'Safety Margin (SAR)',
    safetyPct: 'Safety Margin (%)',
    grossMargin: 'Contribution Margin',
    progress: 'Progress to Break-Even',
    breakeven: 'Break-Even',
    current: 'Current',
    ofBreakeven: 'of Break-Even'
  },
  vat: {
    vatInput: 'Input VAT',
    vatOutput: 'Output VAT',
    netPayable: 'Net VAT Payable',
    fromPurchases: 'From supplier invoices',
    fromRevenue: 'From sales',
    payable: 'Payable',
    refundable: 'Refundable',
    bySupplier: 'VAT Detail by Supplier',
    invoiceCount: 'Invoices',
    subtotal: 'Subtotal',
    vatAmount: 'VAT Amount',
    total: 'Total'
  },
  waste: {
    totalValue: 'Total Waste Value',
    pctOfRevenue: '% of Revenue',
    topProduct: 'Top Waste Product',
    byProduct: 'Waste by Product',
    product: 'Product',
    totalKg: 'Production (kg)',
    wasteG: 'Waste (g)',
    wastePct: 'Waste %',
    wasteValue: 'Waste Value',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },
  audit: {
    desc: 'Complete log of all system operations',
    searchPlaceholder: 'Search by user or table...',
    allActions: 'All Actions',
    time: 'Time',
    user: 'User',
    action: 'Action',
    table: 'Table',
    recordId: 'Record ID',
    ip: 'IP Address'
  },
  users: {
    desc: 'Manage user accounts and permissions',
    addUser: 'Add User',
    newUser: 'New User',
    created: 'User created successfully',
    fullName: 'Full Name',
    username: 'Username',
    role: 'Role',
    active: 'Active',
    inactive: 'Inactive',
    searchPlaceholder: 'Search users...'
  },
  reports: {
    pageTitle: 'Reports Center',
    pageDescription: 'Get comprehensive insights into your business performance with our detailed financial reports and analytics. All data is updated in real-time.',
    dateRangeLabel: 'Selected Date Range',
    categoriesFinancial: '📊 Financial Statements',
    categoriesAnalysis: '📈 Advanced Analytics',
    categoriesOperational: '⚙️ Operational Reports',
    filterIndicator: 'Requires date filter',
    viewReport: 'View Report',
    footerTipTitle: '💡 Tip',
    footerTipDescription: 'All reports can be exported as PDF and Excel files. Use date filters to narrow down the data you want to analyze.',
    buttonGetStarted: 'Get Started',
    buttonBackDashboard: 'Back to Dashboard',
    badgeFinancial: 'Financial',
    badgeAnalysis: 'Analysis',
    badgeInvestment: 'Investment',
    badgeSecurity: 'Security',
    incomeStatement: {
      title: 'Income Statement',
      description: 'Revenue and expenses statement for a specified time period'
    },
    balanceSheet: {
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity position on a specific date'
    },
    cashFlow: {
      title: 'Cash Flow Statement',
      description: 'Inflow and outflow of cash during a time period'
    },
    trialBalance: {
      title: 'Trial Balance',
      description: 'Verify account balance before final posting'
    },
    performance: {
      title: 'Performance Assessment',
      description: 'Analyze revenue, expenses, and profits over time'
    },
    channelAnalysis: {
      title: 'Channel Analysis',
      description: 'Compare revenue and performance by distribution channel'
    },
    vatSummary: {
      title: 'VAT Summary',
      description: 'Details of VAT on purchases and sales'
    },
    wasteAnalysis: {
      title: 'Waste Analysis',
      description: 'Track waste ratio from raw materials and lost value'
    },
    breakeven: {
      title: 'Break-Even Point',
      description: 'Calculate break-even point and operational safety margin'
    },
    ledger: {
      title: 'General Ledger',
      description: 'Details of all transactions on each account'
    },
    auditLog: {
      title: 'Audit Log',
      description: 'Track all operations, modifications, and users'
    },
    channelDesc: 'Analyze revenue across Delivery platforms, Restaurant, and Subscriptions',
    revenueShare: 'Revenue Share',
    channelComparison: 'Channel Comparison',
    channel: 'Channel',
    revenue: 'Revenue',
    share: 'Share',
    transactions: 'Transactions',
    avgPerDay: 'Avg / Day',
    vatDesc: 'Details of VAT on purchases and sales',
    wasteDesc: 'Track waste ratio from raw materials and lost value',
    breakevenDesc: 'Calculate break-even point and operational safety margin'
  },
  channels: {
    delivery: 'Delivery',
    restaurant: 'Restaurant',
    subscriptions: 'Subscriptions'
  },
  balanceSheet: {
    title: 'Balance Sheet',
    asOf: 'As of',
    details: 'Balance Sheet Details',
    balanced: 'Balanced',
    unbalanced: 'Unbalanced',
    assets: 'Assets',
    liabilities: 'Liabilities',
    equity: 'Equity',
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Liabilities',
    totalEquity: 'Total Equity',
    totalLiabEquity: 'Total Liabilities & Equity',
    allAssetsTotal: 'Total Current & Fixed Assets',
    noData: 'No data',
    exportExcel: 'Export Excel',
    kpi: {
      totalAssets: 'Total Assets',
      totalLiabilities: 'Total Liabilities',
      totalEquity: 'Total Equity'
    }
  }
}
