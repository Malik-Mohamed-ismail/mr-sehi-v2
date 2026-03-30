export default {
  validation: {
    required: 'حقل مطلوب'
  },
  settings: {
    pageTitle: 'الإعدادات',
    pageSubtitle: 'System Configuration & User Management',
    tabs: {
      system: 'إعدادات النظام',
      users: 'المستخدمين والصلاحيات',
      audit: 'سجل النظام'
    },
    system: {
      messages: {
        saveSuccess: 'تم الحفظ بنجاح',
        error: 'حدث خطأ أثناء الحفظ'
      },
      title: 'الملف التعريفي والضريبي',
      description: 'هذه البيانات ستظهر في الفواتير المطبوعة والإقرارات الضريبية.',
      fields: {
        restaurantName: 'اسم المطعم (الرسمي)',
        crNumber: 'السجل التجاري (CR)',
        taxNumber: 'الرقم الضريبي (VAT No)',
        vatRate: 'نسبة ضريبة القيمة المضافة (%)'
      },
      buttons: {
        saving: 'جارٍ الحفظ...',
        save: 'حفظ الإعدادات'
      }
    },
    users: {
      messages: {
        createSuccess: 'تمت إضافة المستخدم بنجاح',
        error: 'حدث خطأ'
      },
      roles: {
        admin: 'مدير نظام',
        accountant: 'محاسب',
        cashier: 'كاشير'
      },
      status: {
        active: 'مفعل',
        inactive: 'معطل'
      },
      section1: 'بيانات المستخدم الجديد',
      fields: {
        fullName: 'الاسم الكامل',
        username: 'اسم المستخدم (للدخول)',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        role: 'الصلاحية'
      },
      buttons: {
        cancel: 'إلغاء',
        saving: 'جارٍ الحفظ...',
        save: '💾 إضافة المستخدم',
        newUser: 'مستخدم جديد'
      },
      table: {
        title: 'قائمة المستخدمين',
        fullName: 'الاسم الكامل',
        username: 'اسم الدخول',
        email: 'البريد الإلكتروني',
        role: 'الصلاحية',
        status: 'الحالة'
      }
    },
    audit: {
      title: 'سجل حركات النظام',
      table: {
        datetime: 'التاريخ والوقت',
        user: 'المستخدم',
        action: 'العملية',
        table: 'الجدول',
        details: 'التفاصيل (JSON)'
      },
      showDetails: 'عرض التفاصيل'
    }
  },
  trialBalance: {
    exportTitle: 'ميزان_المراجعة',
    pageTitle: 'ميزان المراجعة',
    pageSubtitle: 'Trial Balance',
    filter: {
      update: 'تحديث'
    },
    table: {
      accountCode: 'كود الحساب',
      accountName: 'اسم الحساب',
      type: 'النوع',
      totalDebit: 'إجمالي المدين',
      totalCredit: 'إجمالي الدائن',
      balance: 'الرصيد',
      total: 'المجموع',
      export: 'تصدير Excel'
    },
    status: {
      balanced: '✓ الميزان متوازن',
      unbalanced: '✗ الميزان غير متوازن'
    }
  },
  ledger: {
    exportTitle: 'دفتر_الاستاذ',
    pageTitle: 'الأستاذ العام',
    pageSubtitle: 'General Ledger',
    filter: {
      accountCode: 'كود الحساب (اختياري)',
      codePlaceholder: 'مثال: 1101',
      from: 'من',
      to: 'إلى',
      search: 'بحث'
    },
    table: {
      date: 'التاريخ',
      entryNumber: 'رقم القيد',
      description: 'البيان',
      account: 'الحساب',
      debit: 'مدين',
      credit: 'دائن',
      balance: 'الرصيد',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  performance: {
    pageTitle: 'تقييم الأداء المالي',
    pageSubtitle: 'تحليل المبيعات والمصروفات والأرباح خلال الفترة المحددة',
    filter: {
      from: 'من',
      to: 'إلى'
    },
    kpi: {
      totalRevenue: 'إجمالي الإيرادات',
      totalExpenses: 'إجمالي المصروفات (شامل التكلفة)',
      netProfit: 'صافي الربح',
      margin: 'الهامش:'
    },
    chart: {
      title: 'الأداء المالي عبر الزمن',
      revenue: 'الإيرادات',
      expenses: 'المصروفات',
      profit: 'صافي الربح'
    }
  },
  incomeStatement: {
    exportTitle: 'قائمة_الدخل',
    pageTitle: 'قائمة الدخل',
    pageSubtitle: 'تقرير الأرباح والخسائر',
    filter: {
      from: 'من',
      to: 'إلى',
      update: 'تحديث'
    },
    table: {
      item: 'البند',
      amount: 'المبلغ (ريال)',
      percentage: '%',
      export: 'تصدير Excel'
    },
    items: {
      revenuesHeader: 'الإيرادات',
      deliveryRevenue: 'إيرادات التوصيل',
      restaurantRevenue: 'إيرادات المطعم',
      subscriptionsRevenue: 'إيرادات الاشتراكات',
      totalRevenue: 'إجمالي الإيرادات',
      cogsHeader: 'تكلفة البضاعة المباعة',
      purchases: 'المشتريات',
      grossProfit: 'مجمل الربح',
      expensesHeader: 'المصروفات التشغيلية',
      totalExpenses: 'إجمالي المصروفات',
      netProfit: 'صافي الربح',
      cogsFull: 'تكلفة البضاعة المباعة (المشتريات)'
    }
  },
  journal: {
    messages: {
      createSuccess: 'تم حفظ القيد المحاسبي',
      reverseSuccess: 'تم عكس القيد بنجاح',
      error: 'حدث خطأ'
    },
    sourceTypes: {
      purchase: 'مشتريات',
      revenue: 'إيرادات',
      expense: 'مصروفات',
      reversal: 'عكس',
      manual: 'يدوي'
    },
    exportTitle: 'قيود_اليومية',
    pageTitle: 'قيود اليومية',
    pageSubtitle: 'القيود المحاسبية مزدوجة القيد',
    newEntry: 'قيد جديد',
    section1: 'بيانات القيد',
    section2: 'أسطر القيد',
    fields: {
      date: 'التاريخ',
      description: 'البيان',
      reference: 'المرجع',
      account: 'الحساب',
      debit: 'مدين',
      credit: 'دائن',
      selectAccount: 'اختر الحساب'
    },
    buttons: {
      addLine: 'إضافة سطر',
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ القيد',
      reverse: 'عكس'
    },
    balance: {
      balanced: 'القيد متوازن ✓',
      unbalanced: 'القيد غير متوازن — الفرق:',
      currency: 'ريال',
      totalDebit: 'مدين:',
      totalCredit: 'دائن:'
    },
    table: {
      entryNumber: 'رقم القيد',
      date: 'التاريخ',
      description: 'البيان',
      source: 'المصدر',
      reference: 'المرجع',
      amount: 'المبلغ',
      isBalanced: 'متوازن',
      status: 'الحالة',
      reverse: 'عكس',
      yes: 'نعم',
      no: 'لا',
      reversed: 'مُعكوس',
      active: 'فعّال',
      export: 'تصدير Excel',
      empty: 'لا توجد قيود',
      debitAccount: 'حساب المدين',
      creditAccount: 'حساب الدائن'
    },
    dialogs: {
      reverseTitle: 'عكس القيد',
      reverseMessage: 'سيتم إنشاء قيد عكسي يُلغي أثر هذا القيد. هذا الإجراء لا يمكن التراجع عنه.',
      manualReverseReason: 'عكس يدوي'
    }
  },
  accounts: {
    types: {
      asset: 'أصول',
      liability: 'التزامات',
      equity: 'حقوق ملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات'
    },
    messages: {
      createSuccess: 'تمت إضافة الحساب بنجاح',
      error: 'حدث خطأ'
    },
    exportTitle: 'دليل_الحسابات',
    pageTitle: 'دليل الحسابات',
    accountCount: 'حساب',
    newAccount: 'حساب جديد',
    section1: 'بيانات الحساب الجديد',
    fields: {
      code: 'الكود',
      nameAr: 'الاسم (عربي)',
      nameEn: 'الاسم (إنجليزي)',
      accountType: 'نوع الحساب',
      parentCode: 'كود الحساب الرئيسي',
      parentCodePlaceholder: 'اختياري',
      level: 'المستوى'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ الحساب'
    },
    table: {
      code: 'الكود',
      nameAr: 'اسم الحساب',
      nameEn: 'Account Name',
      level: 'المستوى',
      isSystem: 'النظام',
      yes: 'نعم',
      no: 'لا',
      export: 'تصدير Excel'
    }
  },
  production: {
    messages: {
      createSuccess: 'تم تسجيل الإنتاج',
      error: 'حدث خطأ'
    },
    exportTitle: 'سجل_الإنتاج',
    pageTitle: 'الإنتاج والتالف',
    pageSubtitle: 'متابعة الإنتاج اليومي ونسبة الهدر',
    newProduction: 'تسجيل إنتاج',
    section1: 'ملخص الإنتاج',
    fields: {
      date: 'التاريخ',
      productName: 'اسم المنتج',
      producedKg: 'الإنتاج (كجم)',
      wasteGrams: 'التالف (جرام)',
      wasteValue: 'قيمة التالف (ريال)',
      unitCost: 'سعر التكلفة/كجم'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ'
    },
    table: {
      date: 'التاريخ',
      product: 'المنتج',
      productionKg: 'الإنتاج (كجم)',
      wasteGrams: 'التالف (جم)',
      wasteValue: 'قيمة التالف',
      wastePct: 'نسبة التالف',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  subscribers: {
    validation: {
      nameRequired: 'الاسم مطلوب',
      amountRequired: 'المبلغ مطلوب',
      startDateRequired: 'تاريخ البداية مطلوب',
      endDateRequired: 'تاريخ النهاية مطلوب'
    },
    status: {
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'ملغي'
    },
    messages: {
      createSuccess: 'تم إضافة المشترك',
      renewSuccess: 'تم تجديد الاشتراك وإنشاء قيد الإيراد تلقائياً',
      error: 'حدث خطأ'
    },
    exportTitle: 'الاشتراكات',
    pageTitle: 'متابعة الاشتراكات',
    pageSubtitle: 'إدارة المشتركين وتجديد الاشتراكات',
    newSubscriber: 'مشترك جديد',
    alerts: {
      expiringSubscribers: 'مشتركين',
      expiringSoon: 'تنتهي اشتراكاتهم خلال 7 أيام'
    },
    kpi: {
      active: 'المشتركون النشطون',
      expired: 'المنتهية اشتراكاتهم',
      mrr: 'الدخل الشهري (MRR)'
    },
    section1: 'بيانات المشترك',
    fields: {
      name: 'اسم المشترك',
      phone: 'رقم الجوال',
      planName: 'اسم الباقة',
      planAmount: 'قيمة الاشتراك (ريال)',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      paymentMethod: 'طريقة الدفع',
      notes: 'ملاحظات'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ المشترك',
      renew: 'تجديد',
      renewTitle: 'تجديد الاشتراك'
    },
    tabs: {
      all: 'الكل',
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'ملغي'
    },
    table: {
      subscriber: 'المشترك',
      phone: 'الجوال',
      plan: 'الباقة',
      endDate: 'تاريخ الانتهاء',
      amount: 'القيمة',
      status: 'الحالة',
      action: 'الإجراء',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  suppliers: {
    validation: {
      nameArRequired: 'الاسم العربي مطلوب'
    },
    messages: {
      createSuccess: 'تم إضافة المورد',
      error: 'حدث خطأ'
    },
    exportTitle: 'الموردين',
    pageTitle: 'الموردين',
    pageSubtitle: 'إدارة بيانات الموردين وأرقام ضريبة القيمة المضافة',
    newSupplier: 'مورد جديد',
    section1: 'بيانات المورد',
    fields: {
      nameAr: 'الاسم بالعربي',
      nameEn: 'الاسم بالإنجليزي',
      vatNumber: 'رقم ضريبة القيمة المضافة',
      vatHelper: 'اتركه فارغاً إذا كان المورد معفى من الضريبة',
      hasVat: 'هل المورد مسجل في ضريبة القيمة المضافة؟',
      category: 'التصنيف',
      selectCategory: 'اختر التصنيف',
      phone: 'الجوال',
      email: 'البريد الإلكتروني'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ المورد'
    },
    table: {
      name: 'اسم المورد',
      category: 'التصنيف',
      vatNumber: 'رقم الضريبة',
      phone: 'الجوال',
      vatStatus: 'ضريبة القيمة المضافة',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'معطّل',
      registered: 'مسجل',
      exempt: 'معفى',
      export: 'تصدير Excel',
      empty: 'لا يوجد موردون'
    },
    ledger: {
      title: 'كشف حساب مورد:',
      subtitle: 'تتبع الفواتير والمدفوعات والرصيد المستحق',
      totalInvoices: 'إجمالي الفواتير',
      totalVat: 'إجمالي الضريبة (مشتريات)',
      outstandingBalance: 'الرصيد المستحق (آجل)',
      invoicesLog: 'سجل الفواتير',
      table: {
        invoiceNumber: 'رقم الفاتورة',
        date: 'التاريخ',
        description: 'البيان',
        paymentMethod: 'طريقة الدفع',
        subtotal: 'الإجمالي قبل الضريبة',
        vat: 'الضريبة',
        total: 'الإجمالي'
      }
    }
  },
  pettyCash: {
    messages: {
      createSuccess: 'تم حفظ العهدة',
      error: 'حدث خطأ'
    },
    exportTitle: 'صندوق_النثرية',
    pageTitle: 'العهدة والصندوق',
    pageSubtitle: 'متابعة النقدية اليومية والمطابقة',
    newEntry: 'تسجيل يومي',
    reconciliation: {
      today: 'مطابقة اليوم — ',
      openingBalance: 'رصيد أول المدة',
      replenishment: 'عهدة الكاشير',
      expected: 'رصيد متوقع',
      variance: 'فارق'
    },
    section1: 'بيانات الصندوق اليومي',
    fields: {
      date: 'التاريخ',
      openingBalance: 'رصيد أول المدة',
      replenishment: 'عهدة الكاشير',
      cashPurchases: 'مشتريات كاش',
      cardPurchases: 'مشتريات بطاقة',
      expectedBalance: 'الرصيد المتوقع',
      closingBalance: 'رصيد آخر المدة الفعلي'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ'
    },
    table: {
      date: 'التاريخ',
      opening: 'رصيد الافتتاح',
      replenishment: 'العهدة',
      purchases: 'المشتريات',
      closing: 'الرصيد الختامي',
      variance: 'الفارق',
      status: 'المطابقة',
      balanced: 'متطابق',
      unbalanced: 'يوجد عجز/زيادة',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  expenses: {
    messages: {
      createSuccess: 'تم حفظ المصروف',
      error: 'حدث خطأ'
    },
    exportTitle: 'المصروفات',
    pageTitle: 'إدخال المصروفات',
    pageSubtitle: 'تسجيل المصروفات التشغيلية مع القيد المحاسبي',
    newExpense: 'مصروف جديد',
    section1: 'بيانات المصروف',
    fields: {
      date: 'التاريخ',
      account: 'الحساب',
      expenseType: 'نوع المصروف',
      paymentMethod: 'طريقة الدفع',
      description: 'البيان',
      amount: 'المبلغ',
      includesVat: 'يشمل ضريبة القيمة المضافة 15%',
      vat: 'الضريبة',
      total: 'الإجمالي'
    },
    types: {
      fixed: 'ثابت',
      variable: 'متغير',
      operational: 'تشغيلي',
      emergency: 'طارئ'
    },
    accounts: {
      a5201: 'رواتب وأجور',
      a5202: 'إيجار',
      a5203: 'كهرباء وماء',
      a5204: 'صيانة',
      a5205: 'تسويق وإعلان',
      a5206: 'نقل ومواصلات',
      a5207: 'اتصالات وانترنت',
      a5208: 'مصاريف إدارية',
      a5209: 'مصاريف متنوعة',
      a5210: 'تالف وهدر'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ المصروف'
    },
    table: {
      date: 'التاريخ',
      description: 'البيان',
      type: 'النوع',
      paymentMethod: 'طريقة الدفع',
      amount: 'المبلغ',
      vat: 'الضريبة',
      total: 'الإجمالي',
      empty: 'لا توجد بيانات'
    }
  },
  subscriptions: {
    messages: {
      createSuccess: 'تم حفظ إيراد الاشتراكات',
      error: 'حدث خطأ'
    },
    exportTitle: 'إيرادات_الاشتراكات',
    pageTitle: 'إيرادات الاشتراكات',
    pageSubtitle: 'مدفوعات المشتركين الشهرية',
    newRevenue: 'إضافة إيراد',
    kpi: {
      totalRevenue: 'إجمالي إيرادات الاشتراكات'
    },
    fields: {
      amount: 'المبلغ (ريال)',
      paymentMethod: 'طريقة الدفع',
      notes: 'ملاحظات'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ'
    },
    table: {
      date: 'التاريخ',
      amount: 'المبلغ',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  restaurant: {
    messages: {
      createSuccess: 'تم حفظ إيراد المطعم',
      error: 'حدث خطأ'
    },
    exportTitle: 'إيرادات_المطعم',
    pageTitle: 'إيرادات المطعم',
    pageSubtitle: 'المبيعات اليومية داخل المطعم',
    newRevenue: 'إضافة إيراد',
    kpi: {
      totalRevenue: 'إجمالي إيرادات المطعم'
    },
    section1: 'بيانات الإيراد',
    fields: {
      amount: 'المبلغ (ريال)',
      coversCount: 'عدد الأغطية',
      paymentMethod: 'طريقة الدفع',
      notes: 'ملاحظات'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ'
    },
    table: {
      date: 'التاريخ',
      amount: 'المبلغ',
      covers: 'الأغطية',
      export: 'تصدير Excel',
      empty: 'لا توجد بيانات'
    }
  },
  delivery: {
    validation: {
      dateRequired: 'التاريخ مطلوب',
      grossPositive: 'المبلغ يجب أن يكون أكبر من صفر'
    },
    messages: {
      createSuccess: 'تم حفظ إيراد التوصيل',
      error: 'حدث خطأ'
    },
    exportTitle: 'إيرادات_التوصيل',
    pageTitle: 'إيرادات التوصيل',
    newRevenue: 'إضافة إيراد',
    kpi: {
      gross: 'إجمالي الإيرادات',
      commissions: 'العمولات',
      net: 'صافي الإيرادات'
    },
    section1: 'بيانات الإيراد',
    fields: {
      paymentMethod: 'طريقة الدفع',
      grossAmount: 'المبلغ الإجمالي',
      commissionRate: 'نسبة العمولة',
      notes: 'الملاحظات',
      commissionAmount: 'مبلغ العمولة',
      netAmount: 'صافي الإيراد'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ الإيراد'
    },
    table: {
      title: 'سجل الإيرادات',
      export: 'تصدير Excel',
      date: 'التاريخ',
      platform: 'المنصة',
      gross: 'الإجمالي',
      commission: 'العمولة',
      net: 'الصافي',
      empty: 'لا توجد بيانات'
    }
  },
  purchases: {
    validation: {
      supplierRequired: 'يجب اختيار مورد'
    },
    categories: {
      'مواد غذائية': 'مواد غذائية',
      'خضار': 'خضار',
      'بلاستيكيات': 'بلاستيكيات',
      'مشروبات': 'مشروبات',
      'خبز': 'خبز',
      'معدات مطبخ': 'معدات مطبخ',
      'مياه': 'مياه'
    },
    paymentMethods: {
      cash: 'كاش',
      bank: 'بنك',
      credit: 'آجل'
    },
    messages: {
      createSuccess: 'تم حفظ الفاتورة وإنشاء القيد المحاسبي تلقائياً',
      deleteSuccess: 'تم حذف الفاتورة وعكس القيد المحاسبي',
      error: 'حدث خطأ'
    },
    exportTitle: 'مشتريات',
    exportCols: {
      invoiceNumber: 'رقم الفاتورة',
      date: 'التاريخ',
      supplier: 'المورد',
      item: 'الصنف',
      category: 'التصنيف',
      qty: 'الكمية',
      price: 'السعر',
      paymentMethod: 'طريقة الدفع',
      subtotal: 'المجموع قبل الضريبة',
      vat: 'الضريبة',
      total: 'الإجمالي'
    },
    pageTitle: 'إدخال المشتريات',
    pageSubtitle: 'تسجيل فواتير الموردين مع القيد المحاسبي التلقائي',
    newInvoice: 'فاتورة جديدة',
    section1: 'بيانات الفاتورة',
    fields: {
      invoiceNumber: 'رقم الفاتورة',
      date: 'تاريخ الفاتورة',
      supplier: 'المورد',
      selectSupplier: 'اختر المورد',
      category: 'التصنيف',
      item: 'اسم الصنف',
      qty: 'الكمية',
      price: 'سعر الوحدة',
      discount: 'الخصم',
      subtotal: 'المجموع قبل الضريبة',
      vat: 'ضريبة القيمة المضافة 15%',
      exempt: '(معفى)',
      total: 'الإجمالي',
      paymentMethod: 'طريقة الدفع',
      isAsset: 'أصل ثابت (معدات / أثاث)'
    },
    section2: 'الكميات والأسعار',
    section3: 'طريقة الدفع',
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ الفاتورة'
    },
    table: {
      title: 'سجل الفواتير',
      export: 'تصدير Excel',
      empty: 'لا توجد فواتير'
    },
    delete: {
      title: 'حذف الفاتورة',
      message: 'سيتم حذف الفاتورة وعكس القيد المحاسبي تلقائياً. هذا الإجراء لا يمكن التراجع عنه.',
      aria: 'حذف الفاتورة'
    }
  },
  fixedAssets: {
    messages: {
      createSuccess: 'تم إضافة الأصل بنجاح',
      deleteSuccess: 'تم حذف الأصل بنجاح',
      depreciateSuccess: 'تم احتساب وطباعة قيد الإهلاك بنجاح',
      error: 'حدث خطأ غير متوقع'
    },
    exportTitle: 'سجل_الأصول_الثابتة',
    pageTitle: 'إدارة الأصول الثابتة',
    pageSubtitle: 'إنشاء ومتابعة وإهلاك الأصول',
    newAsset: 'أصل جديد',
    kpi: {
      totalCost: 'إجمالي التكلفة الأصلية',
      totalDepreciation: 'إجمالي مجمع الإهلاك',
      netBookValue: 'صافي القيمة الدفترية',
      totalVat: 'إجمالي ضريبة القيمة المضافة',
      totalAssets: 'إجمالي الأصول'
    },
    section1: 'بيانات الأصل الأساسية',
    section2: 'البيانات المالية والإهلاك',
    fields: {
      date: 'تاريخ الشراء',
      assetName: 'اسم الأصل',
      assetType: 'نوع الأصل',
      selectType: 'اختر نوع الأصل',
      cost: 'التكلفة الإجمالية (شامل الضريبة إن وجدت)',
      includesVat: 'يشمل ضريبة القيمة المضافة 15%',
      vat: 'الضريبة (15%)',
      paymentMethod: 'طريقة الدفع',
      usefulLife: 'العمر الإنتاجي (سنوات)',
      description: 'الوصف أو الموديل',
      notes: 'ملاحظات إضافية'
    },
    types: {
      equipment: 'معدات',
      furniture: 'أثاث',
      vehicles: 'مركبات',
      technology: 'تقنية',
      other: 'أصول أخرى'
    },
    buttons: {
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ...',
      save: '💾 حفظ الأصل',
      depreciate: 'إهلاك الدفعة المجمعة'
    },
    table: {
      title: 'سجل الأصول',
      export: 'تصدير Excel',
      empty: 'لا توجد أصول مسجلة',
      date: 'التاريخ',
      asset: 'الأصل',
      name: 'اسم الأصل',
      account: 'حساب الأصل',
      usefulLife: 'العمر الإنتاجي',
      type: 'النوع',
      cost: 'التكلفة',
      vat: 'الضريبة',
      depreciation: 'مجمع الإهلاك',
      netValue: 'القيمة الصافية'
    },
    delete: {
      title: 'حذف الأصل',
      message: 'سيتم حذف الأصل وجميع قيوده المحاسبية المتعلقة به. هل أنت متأكد؟',
      aria: 'حذف الأصل'
    }
  },
  auth: {
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    welcome: 'أهلاً بك،',
    loginError: 'خطأ في تسجيل الدخول',
    subtitle: 'نظام إدارة المطعم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    loggingIn: 'جارٍ تسجيل الدخول...',
    login: 'تسجيل الدخول',
    loginTitle: 'أهلاً بك 👋',
    loginSubtitle: 'سجّل دخولك للمتابعة',
    emailPlaceholder: 'admin@mrsehi.sa',
    footerNote: 'دخول آمن مشغل بواسطة مستر صحي',
  },
  dashboard: {
    financialStory: 'القصة المالية',
    totalRevenue: 'إجمالي الإيرادات',
    thisMonthUp: 'ارتفاع هذا الشهر',
    revenueSources: 'مصادر الإيراد الرئيسية',
    netProfit: 'صافي الربح',
    totalExpenses: 'إجمالي المصروفات',
    activeSubscribers: 'المشتركون النشطون',
    expiringSoon: 'تنتهي قريباً',
    notExpiringSoon: 'لا اشتراكات تنتهي قريباً',
    vat: 'ضريبة القيمة المضافة',
    pettyCash: 'الرصيد النقدي',
    todayBalance: 'رصيد اليوم',
    revenueChannels: 'قنوات الإيراد',
    channels: {
      keeta: 'كيتا',
      hunger: 'هنقرستيشن',
      ninja: 'تطبيق نينجا',
      resto: 'المطعم',
      subs: 'الاشتراكات'
    },
    performanceAnalysis: 'تحليل الأداء',
    revenueVsExpenses: 'الإيرادات والمصروفات',
    last6Days: 'آخر 6 أيام',
    revenue: 'إيرادات',
    expenses: 'مصروفات',
    expensesDistribution: 'توزيع المصروفات',
    thisMonth: 'هذا الشهر',
    recentTransactions: 'أحدث العمليات',
    purchaseInvoices: 'فواتير المشتريات',
    expensesLabels: ['الرواتب', 'الإيجار', 'المواد الخام', 'التسويق', 'المرافق'],
    last8Invoices: 'آخر 8 فواتير مسجلة',
    newInvoice: 'فاتورة جديدة',
    tableHeaders: ['رقم الفاتورة', 'المورد', 'التاريخ', 'قبل الضريبة', 'ضريبة 15%', 'الإجمالي', 'الدفع', 'إجراءات'],
    noInvoices: 'لا توجد فواتير مسجلة',
    vatSummary: 'ملخص ضريبة القيمة المضافة',
    inProgress: 'جارٍ',
    totalTaxableSales: 'إجمالي المبيعات الخاضعة',
    salesVat: 'ضريبة المبيعات (15%)',
    purchasesVat: 'ضريبة المشتريات المدفوعة',
    netVatPayable: 'صافي الضريبة المستحقة',
    profitMargins: 'نسب هوامش الربح',
    grossMargin: 'هامش<br/>الإجمالي',
    operatingMargin: 'هامش<br/>التشغيل',
    netMargin: 'هامش<br/>الصافي',
    quickInsights: 'رؤى سريعة',
    topRevenueChannel: 'أعلى قناة إيراد',
    delivery: 'التوصيل',
    restaurant: 'المطعم',
    subscriptions: 'الاشتراكات',
    deliveryRevenue: 'إيرادات التوصيل',
    expiringSubscriptions: 'اشتراكات تنتهي قريباً',
    subscribers: 'مشتركين',
    subscriber: 'مشترك',
    nextTaxQuarter: 'الربع الضريبي القادم',
    vatPayable: 'ضريبة مستحقة',
    welcome: 'أهلاً وسهلاً',
    lastUpdate: 'آخر تحديث:',
    profitMargin: 'هامش الربح',
    recentTransactionsTitle: 'آخر العمليات في النظام',
    transactionType: 'نوع العملية',
    transactionAmount: 'المبلغ',
    transactionDate: 'التاريخ',
    noRecentTransactions: 'لا توجد عمليات حديثة'
  },
  pages: {
    dashboard: 'لوحة القيادة',
    delivery: 'إيرادات التوصيل',
    restaurant: 'إيرادات المطعم',
    subscriptions: 'إيرادات الاشتراكات',
    purchases: 'المشتريات',
    expenses: 'المصروفات',
    pettyCash: 'العهد و النثرية',
    suppliers: 'الموردين',
    subscribers: 'المشتركين',
    production: 'الإنتاج و الهالك',
    accounts: 'دليل الحسابات',
    journal: 'قيود اليومية',
    ledger: 'دفتر الأستاذ',
    trialBalance: 'ميزان المراجعة',
    incomeStatement: 'قائمة الدخل',
    performance: 'التحليل المالي',
    reports: 'التقارير',
    fixedAssets: 'إدارة الأصول',
    balanceSheet: 'الميزانية العمومية',
    cashFlow: 'التدفقات النقدية',
    channelAnalysis: 'تحليل القنوات',
    wasteAnalysis: 'تحليل الهالك',
    breakeven: 'نقطة التعادل',
    vatSummary: 'ملخص ضريبة القيمة المضافة',
    auditLog: 'سجل المراجعة',
    users: 'إدارة المستخدمين'
  },
  layout: {
    settings: 'الإعدادات',
    title: 'مستر صحي',
    themeLight: 'الوضع المضيء',
    themeDark: 'الوضع الليلي',
    notifications: 'الإشعارات',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي'
  },
  sidebar: {
    systemName: 'نظام الإدارة المالي',
    collapse: 'تصغير القائمة',
    expand: 'توسيع القائمة',
    revenue: 'الإيرادات',
    expenses: 'المصروفات والمشتريات',
    management: 'الإدارة والتشغيل',
    accounting: 'المالية والمحاسبة',
    analysis: 'التحليل والتقارير',
    administration: 'الإدارة والصلاحيات',
    roles: {
      admin: 'مدير النظام',
      accountant: 'محاسب',
      cashier: 'كاشير'
    }
  },
  common: {
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    updateSuccess: 'تم التعديل بنجاح',
    confirm: 'تأكيد',
    back: 'رجوع',
    search: 'بحث...',
    apply: 'تطبيق',
    filter: 'تصفية',
    all: 'الكل',
    refresh: 'تحديث',
    noData: 'لا توجد بيانات',
    exportPdf: 'تصدير PDF',
    exportExcel: 'تصدير Excel',
    next: 'التالي',
    prev: 'السابق',
    status: 'الحالة'
  },
  dateRange: {
    today: 'اليوم',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذا العام',
    selectRange: 'اختر الفترة',
    from: 'من',
    to: 'إلى'
  },
  cashFlow: {
    operating: 'الأنشطة التشغيلية',
    investing: 'الأنشطة الاستثمارية',
    financing: 'أنشطة التمويل',
    netChange: 'صافي التغير',
    dailyFlow: 'التدفق النقدي اليومي'
  },
  breakeven: {
    aboveBreakeven: 'أنتم فوق نقطة التعادل ✓',
    belowBreakeven: 'أنتم دون نقطة التعادل ✗',
    profitableDesc: 'المطعم يحقق أرباحاً في هذه الفترة',
    lossDesc: 'الإيرادات لم تغطِ التكاليف الثابتة بعد',
    currentRevenue: 'الإيراد الحالي',
    breakevenSales: 'مبيعات نقطة التعادل',
    fixedCosts: 'التكاليف الثابتة',
    safetyMargin: 'هامش الأمان (ريال)',
    safetyPct: 'هامش الأمان (%)',
    grossMargin: 'هامش المساهمة',
    progress: 'التقدم نحو نقطة التعادل',
    breakeven: 'نقطة التعادل',
    current: 'الحالي',
    ofBreakeven: 'من نقطة التعادل'
  },
  vat: {
    vatInput: 'ضريبة المدخلات',
    vatOutput: 'ضريبة المخرجات',
    netPayable: 'صافي الضريبة المستحقة',
    fromPurchases: 'من فواتير الموردين',
    fromRevenue: 'من المبيعات',
    payable: 'مستحقة الدفع',
    refundable: 'قابلة للاسترداد',
    bySupplier: 'تفاصيل الضريبة حسب المورد',
    invoiceCount: 'عدد الفواتير',
    subtotal: 'قبل الضريبة',
    vatAmount: 'قيمة الضريبة',
    total: 'الإجمالي'
  },
  waste: {
    totalValue: 'إجمالي قيمة الهالك',
    pctOfRevenue: 'نسبة من الإيراد',
    topProduct: 'أعلى منتج هالك',
    byProduct: 'الهالك حسب المنتج',
    product: 'المنتج',
    totalKg: 'الإنتاج (كجم)',
    wasteG: 'الهالك (جم)',
    wastePct: 'نسبة الهالك',
    wasteValue: 'قيمة الهالك',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض'
  },
  audit: {
    desc: 'سجل كامل بجميع العمليات على النظام',
    searchPlaceholder: 'بحث في المستخدم أو الجدول...',
    allActions: 'جميع الإجراءات',
    time: 'الوقت',
    user: 'المستخدم',
    action: 'الإجراء',
    table: 'الجدول',
    recordId: 'معرّف السجل',
    ip: 'عنوان IP'
  },
  users: {
    desc: 'إدارة حسابات المستخدمين والصلاحيات',
    addUser: 'إضافة مستخدم',
    newUser: 'مستخدم جديد',
    created: 'تم إنشاء المستخدم بنجاح',
    fullName: 'الاسم الكامل',
    username: 'اسم المستخدم',
    role: 'الصلاحية',
    active: 'نشط',
    inactive: 'غير نشط',
    searchPlaceholder: 'ابحث عن المستخدمين...',
    updated: 'تم تحديث المستخدم بنجاح',
    deleted: 'تم حذف المستخدم بنجاح',
    statusUpdated: 'تم تحديث حالة المستخدم بنجاح',
    confirmDelete: 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.'
  },
  reports: {
    pageTitle: 'مركز التقارير المالية',
    pageDescription: 'اجمع رؤى شاملة عن أداء عملك من خلال مجموعة متنوعة من التقارير المالية والتحليلات العميقة. جميع البيانات محدثة في الوقت الفعلي.',
    dateRangeLabel: 'نطاق التاريخ المختار',
    categoriesFinancial: '📊 البيانات المالية',
    categoriesAnalysis: '📈 التحليلات المتقدمة',
    categoriesOperational: '⚙️ التقارير التشغيلية',
    filterIndicator: 'يتطلب تصفية التاريخ',
    viewReport: 'عرض التقرير',
    footerTipTitle: '💡 نصيحة',
    footerTipDescription: 'جميع التقارير قابلة للتصدير كملفات PDF و Excel. استخدم مرشحات التاريخ لتضييق نطاق البيانات التي تريد تحليلها.',
    buttonGetStarted: 'ابدأ هنا',
    buttonBackDashboard: 'العودة للرئيسية',
    badgeFinancial: 'مالي',
    badgeAnalysis: 'تحليل',
    badgeInvestment: 'استثماري',
    badgeSecurity: 'أمان',
    incomeStatement: {
      title: 'قائمة الدخل',
      description: 'بيان بالإيرادات والمصروفات في فترة زمنية محددة'
    },
    balanceSheet: {
      title: 'الميزانية العمومية',
      description: 'موقف الأصول والخصوم والملكية في تاريخ معين'
    },
    cashFlow: {
      title: 'بيان التدفق النقدي',
      description: 'حركة النقد الداخلة والخارجة خلال فترة زمنية'
    },
    trialBalance: {
      title: 'ميزان المراجعة',
      description: 'تحقق من توازن الحسابات قبل الترحيل النهائي'
    },
    performance: {
      title: 'تقييم الأداء',
      description: 'تحليل الإيرادات والمصروفات والأرباح عبر الزمن'
    },
    channelAnalysis: {
      title: 'تحليل القنوات',
      description: 'مقارنة الإيرادات والأداء حسب قناة التوزيع'
    },
    vatSummary: {
      title: 'ملخص الضريبة المضافة',
      description: 'تفاصيل الضريبة المضافة على المشتريات والمبيعات'
    },
    wasteAnalysis: {
      title: 'تحليل الهدر',
      description: 'متابعة نسبة الهدر من المواد الخام والقيمة المفقودة'
    },
    breakeven: {
      title: 'نقطة التعادل',
      description: 'حساب نقطة التعادل والهامش الآمن للعمليات'
    },
    ledger: {
      title: 'الأستاذ العام',
      description: 'تفاصيل جميع الحركات على كل حساب'
    },
    auditLog: {
      title: 'سجل المراجعة',
      description: 'تتبع جميع العمليات والتعديلات والمستخدمين'
    },
    channelDesc: 'تحليل الإيرادات عبر منصات التوصيل وداخل المطعم والاشتراكات',
    revenueShare: 'حصة الإيرادات',
    channelComparison: 'مقارنة القنوات',
    channel: 'القناة',
    revenue: 'الإيراد',
    share: 'الحصة',
    transactions: 'العمليات',
    avgPerDay: 'متوسط يومي',
    vatDesc: 'تفاصيل ضريبة القيمة المضافة على المشتريات والمبيعات',
    wasteDesc: 'متابعة نسبة الهدر من المواد الخام والقيمة المفقودة',
    breakevenDesc: 'حساب نقطة التعادل والهامش الآمن للعمليات'
  },
  channels: {
    delivery: 'التوصيل',
    restaurant: 'المطعم',
    subscriptions: 'الاشتراكات'
  },
  balanceSheet: {
    title: 'الميزانية العمومية',
    asOf: 'كما في تاريخ',
    details: 'تفاصيل الميزانية العمومية',
    balanced: 'متوازنة',
    unbalanced: 'غير متوازنة',
    assets: 'الأصول',
    liabilities: 'الالتزامات',
    equity: 'حقوق الملكية',
    totalAssets: 'إجمالي الأصول',
    totalLiabilities: 'إجمالي الالتزامات',
    totalEquity: 'إجمالي حقوق الملكية',
    totalLiabEquity: 'إجمالي الالتزامات وحقوق الملكية',
    allAssetsTotal: 'مجموع الأصول المتداولة والثابتة',
    noData: 'لا يوجد بيانات',
    exportExcel: 'تصدير Excel',
    kpi: {
      totalAssets: 'إجمالي الأصول',
      totalLiabilities: 'إجمالي الالتزامات',
      totalEquity: 'إجمالي حقوق الملكية'
    }
  }
}
