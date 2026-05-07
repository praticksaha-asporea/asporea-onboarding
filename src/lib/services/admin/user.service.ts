import { FilterUserListQuery } from '@/Types/Backend_Payload/user.types';
import UserModel from '../../models/User.model';

export const userList = async ({
  role,
  keyword,
  page = 1,
  limit = 10,
}: FilterUserListQuery & {
  page?: number;
  limit?: number;
  keyword?: string;
}) => {
  const validRoles = ["admin","tac","user","reception","finance","coordinator","pca","pcra","institute","sub_pca","branch_head","tac_head"] as const;

  /* ── Build base Mongo filter ───────────────────────────── */
  const filter: Record<string, unknown> =
    role && validRoles.includes(role)
      ? { role }
      : { role: { $in: validRoles } };

  /* ── Add keyword search if provided ───────────────────── */
  if (keyword && keyword.trim().length > 0) {
    const regex = new RegExp(keyword.trim(), 'i'); // case-insensitive
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  /* ── Pagination ───────────────────────────── */
  const skip = (page - 1) * limit;

  /* ── Query DB ───────────────────────────── */
  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select('-password') // never expose passwords
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filter),
  ]);

  /* ── Shape response ───────────────────────────── */
  const totalPages = Math.ceil(total / limit);

  return {
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

