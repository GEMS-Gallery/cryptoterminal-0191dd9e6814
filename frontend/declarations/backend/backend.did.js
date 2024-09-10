export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'timestamp' : Time,
  });
  return IDL.Service({
    'createPost' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [IDL.Nat],
        [],
      ),
    'getPost' : IDL.Func([IDL.Nat], [IDL.Opt(Post)], ['query']),
    'getPosts' : IDL.Func([], [IDL.Vec(Post)], ['query']),
    'searchPosts' : IDL.Func([IDL.Text], [IDL.Vec(Post)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
