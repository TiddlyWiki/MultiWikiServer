Prisma's migration system usually works well. For now it's easier while we're still working on the database architecture because we can easily detect where someone is at and then upgrade them. 

The database is definitely not backward-compatible with the multi-wiki-support branch. 

Once we get to a stable product we can use the migrations to detect databases from this version of MWS and do one final upgrade.

I'm not really excited about the idea of having a migration path in the wild. Prisma works well, but nothing is perfect and there could always be edge cases. It's usually better to have a clear import/export process. 

We'll probably end up importing and exporting bags via tiddlywiki.

### Line endings (in case git ever messes this up)



