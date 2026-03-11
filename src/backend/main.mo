import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type ScoreEntry = {
    name : Text;
    score : Int;
  };

  module ScoreEntry {
    public func compare(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      Int.compare(entry2.score, entry1.score);
    };
  };

  let scores = Map.empty<Text, Int>();

  public shared ({ caller }) func submitScore(name : Text, score : Int) : async () {
    switch (scores.get(name)) {
      case (?existingScore) {
        if (score > existingScore) {
          scores.add(name, score);
        };
      };
      case (null) { scores.add(name, score) };
    };
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    scores.entries().map(func((name, score)) { { name; score } }).toArray().sort().sliceToArray(0, 10);
  };

  public query ({ caller }) func getDailyChallengeSeed(date : Int) : async Int {
    let seed = (date * 2654435761) % 1000000;
    if (seed < 0) { Runtime.trap("Invalid seed") };
    seed;
  };
};
