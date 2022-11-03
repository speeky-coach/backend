type CreateInput = {
  studentId: string;
  tokenPayment: string;
  planId: string;
};

class SubscriptionApplication {
  constructor() {}

  async create({ studentId, tokenPayment, planId }: CreateInput): Promise<Subscription> {
    let student = await this.studentService.getById(studentId);

    if (!student) {
    }
  }
}

export default SubscriptionApplication;
