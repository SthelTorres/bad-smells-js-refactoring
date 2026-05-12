const REGULAR_USER_MAX_ITEM_VALUE = 500;
const PRIORITY_ITEM_VALUE_THRESHOLD = 1000;
const ROLE_ADMIN = 'ADMIN';

const formatters = {
  CSV: {
    header() {
      return 'ID,NOME,VALOR,USUARIO\n';
    },
    row(item, user) {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    },
    footer(total) {
      return `\nTotal,,\n${total},,\n`;
    },
  },
  HTML: {
    header(user) {
      return (
        '<html><body>\n' +
        '<h1>Relatório</h1>\n' +
        `<h2>Usuário: ${user.name}</h2>\n` +
        '<table>\n' +
        '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
      );
    },
    row(item) {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    },
    footer(total) {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    },
  },
};

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = this.#getFormatter(reportType);
    const visibleItems = this.#filterVisibleItems(user, items);

    if (this.#isAdmin(user)) {
      this.#flagPriorityItems(visibleItems);
    }

    const total = this.#calculateTotal(visibleItems);

    const header = formatter.header(user);
    const body = visibleItems.map((item) => formatter.row(item, user)).join('');
    const footer = formatter.footer(total);

    return (header + body + footer).trim();
  }

  #getFormatter(reportType) {
    return formatters[reportType];
  }

  #isAdmin(user) {
    return user.role === ROLE_ADMIN;
  }

  #filterVisibleItems(user, items) {
    if (this.#isAdmin(user)) {
      return items;
    }
    return items.filter((item) => item.value <= REGULAR_USER_MAX_ITEM_VALUE);
  }

  #flagPriorityItems(items) {
    for (const item of items) {
      if (item.value > PRIORITY_ITEM_VALUE_THRESHOLD) {
        item.priority = true;
      }
    }
  }

  #calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }
}
