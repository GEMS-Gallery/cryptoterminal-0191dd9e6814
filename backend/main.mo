import Hash "mo:base/Hash";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

actor {
  type Post = {
    id: Nat;
    title: Text;
    content: Text;
    timestamp: Time.Time;
    tags: [Text];
  };

  stable var nextPostId: Nat = 0;
  let posts = HashMap.HashMap<Nat, Post>(0, Nat.equal, Nat.hash);

  public func createPost(title: Text, content: Text, tags: [Text]): async Nat {
    let id = nextPostId;
    let post: Post = {
      id;
      title;
      content;
      timestamp = Time.now();
      tags;
    };
    posts.put(id, post);
    nextPostId += 1;
    id
  };

  public query func getPosts(): async [Post] {
    Iter.toArray(posts.vals())
  };

  public query func getPost(id: Nat): async ?Post {
    posts.get(id)
  };

  public query func searchPosts(searchQuery: Text): async [Post] {
    let searchLower = Text.toLowercase(searchQuery);
    Array.filter<Post>(Iter.toArray(posts.vals()), func (post) {
      Text.contains(Text.toLowercase(post.title), #text searchLower) or
      Text.contains(Text.toLowercase(post.content), #text searchLower) or
      Array.find<Text>(post.tags, func (tag) {
        Text.contains(Text.toLowercase(tag), #text searchLower)
      }) != null
    })
  };
}
