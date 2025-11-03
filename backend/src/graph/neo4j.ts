import neo4j, { Driver, Session } from 'neo4j-driver';

class Neo4jConnection {
  private driver: Driver;

  constructor() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  getSession(): Session {
    return this.driver.session();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async verifyConnection(): Promise<boolean> {
    const session = this.getSession();
    try {
      await session.run('RETURN 1');
      return true;
    } catch (error) {
      console.error('Neo4j connection failed:', error);
      return false;
    } finally {
      await session.close();
    }
  }
}

export default new Neo4jConnection();
