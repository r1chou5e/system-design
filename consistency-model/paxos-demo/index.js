class Acceptor {
  constructor(name) {
    this.name = name;
    this.promisedNumber = null;
    this.acceptedNumber = null;
    this.acceptedValue = null;
  }

  async prepare(n, dropRate = 0.2, delay = 500) {
    if (Math.random() < dropRate) {
      console.log(`${this.name} 🌐 dropped prepare(${n})`);
      return null;
    }

    await this.simulateDelay(delay);

    if (this.promisedNumber === null || n > this.promisedNumber) {
      this.promisedNumber = n;
      console.log(`${this.name} 🤝 promised for ${n}`);
      return {
        promise: true,
        acceptedNumber: this.acceptedNumber,
        acceptedValue: this.acceptedValue,
      };
    } else {
      console.log(`${this.name} ❌ rejected prepare(${n})`);
      return { promise: false };
    }
  }

  async accept(n, value, dropRate = 0.2, delay = 500) {
    if (Math.random() < dropRate) {
      console.log(`${this.name} 🌐 dropped accept(${n}, ${value})`);
      return null;
    }

    await this.simulateDelay(delay);

    if (this.promisedNumber === null || n >= this.promisedNumber) {
      this.promisedNumber = n;
      this.acceptedNumber = n;
      this.acceptedValue = value;
      console.log(`${this.name} ✅ accepted proposal (${n}, ${value})`);
      return true;
    }
    console.log(`${this.name} ❌ rejected accept(${n}, ${value})`);
    return false;
  }

  simulateDelay(maxDelay) {
    return new Promise((resolve) =>
      setTimeout(resolve, Math.random() * maxDelay)
    );
  }
}

class Proposer {
  constructor(id, startingSeq, value) {
    this.id = id;
    this.seq = startingSeq;
    this.value = value;
  }

  // Tạo số proposal duy nhất dựa trên id và seq
  get proposalNumber() {
    return this.id * 1000 + this.seq;
  }

  async propose(acceptors, dropRate = 0.2, delay = 500) {
    console.log(
      `\n=== Proposer ${this.id} (#${this.proposalNumber}) proposing "${this.value}" ===`
    );

    // Phase 1: Prepare
    let promiseResults = await Promise.all(
      acceptors.map((a) => a.prepare(this.proposalNumber, dropRate, delay))
    );

    let promises = promiseResults.filter((res) => res && res.promise);

    if (promises.length <= acceptors.length / 2) {
      console.log(
        `❌ Proposer ${this.id}: Not enough promises. Aborting proposal.`
      );
      return false;
    }

    // Tìm giá trị đã được accept lớn nhất trong số những acceptors đã promise
    let highest = null;
    for (let p of promises) {
      if (p.acceptedNumber !== null) {
        if (!highest || p.acceptedNumber > highest.acceptedNumber) {
          highest = p;
        }
      }
    }

    if (highest && highest.acceptedValue !== null) {
      console.log(
        `⚠️ Proposer ${this.id}: Overriding with previously accepted value: "${highest.acceptedValue}"`
      );
      this.value = highest.acceptedValue;
    }

    // Phase 2: Accept
    let acceptResults = await Promise.all(
      acceptors.map((a) =>
        a.accept(this.proposalNumber, this.value, dropRate, delay)
      )
    );

    let acceptedCount = acceptResults.filter((r) => r === true).length;

    if (acceptedCount > acceptors.length / 2) {
      console.log(
        `✅ Proposer ${this.id}: Value "${this.value}" accepted by majority.`
      );
      return true;
    } else {
      console.log(`❌ Proposer ${this.id}: Not accepted by majority.`);
      return false;
    }
  }
}

// --- Mô phỏng concurrent proposer ---

const acceptors = [
  new Acceptor('A'),
  new Acceptor('B'),
  new Acceptor('C'),
  new Acceptor('D'),
  new Acceptor('E'),
];

(async () => {
  // Tạo 3 proposer đồng thời
  const proposers = [
    new Proposer(1, 1, 'Apple'),
    new Proposer(2, 1, 'Banana'),
    new Proposer(3, 1, 'Cherry'),
  ];

  // Chạy đề xuất song song (concurrent)
  await Promise.all(proposers.map((p) => p.propose(acceptors, 0.3, 800)));
})();
