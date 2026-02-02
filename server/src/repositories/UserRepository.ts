import { User } from '../models';
import { IUser } from '../models/User';

class UserRepository {
    async findAll(): Promise<User[]> {
        return await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
    }

    async findById(id: string): Promise<User | null> {
        return await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
    }
}

export default new UserRepository();
