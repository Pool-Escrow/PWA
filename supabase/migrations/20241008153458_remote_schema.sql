create policy "Give anon users access to JPG images in folder 21vks_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'pool'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (auth.role() = 'anon'::text)));


create policy "Give public users access to upload 1twvzjd_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'profile'::text) AND ((storage.extension(name) = 'png'::text) OR (storage.extension(name) = 'jpg'::text) OR (storage.extension(name) = 'jpeg'::text)) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (lower((storage.foldername(name))[2]) = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))));


create policy "Give public users access to upload 1twvzjd_1"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'profile'::text) AND ((storage.extension(name) = 'png'::text) OR (storage.extension(name) = 'jpg'::text) OR (storage.extension(name) = 'jpeg'::text)) AND (lower((storage.foldername(name))[1]) = 'public'::text) AND (lower((storage.foldername(name))[2]) = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))));


create policy "Images: Allow anyone to view avatars"
on "storage"."objects"
as permissive
for select
to public
using ((storage.filename(name) = 'avatar.png'::text));


create policy "Images: Allow anyone to view banners"
on "storage"."objects"
as permissive
for select
to public
using ((storage.filename(name) = 'banner-image.png'::text));


create policy "Images: Allow main hosts to delete own banners"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = owner_id) AND (storage.filename(name) = 'banner-image.png'::text) AND (bucket_id = 'images'::text) AND ((storage.foldername(name))[1] IN ( SELECT (pp.pool_id)::text AS pool_id
   FROM (pool_participants pp
     JOIN pools p ON ((pp.pool_id = p.internal_id)))
  WHERE (((pp.user_id)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) AND (pp."poolRole" = 'mainHost'::"poolRoles"))))));


create policy "Images: Allow main hosts to update own banners"
on "storage"."objects"
as permissive
for update
to authenticated
using (((((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = owner_id) AND (storage.filename(name) = 'banner-image.png'::text) AND (bucket_id = 'images'::text) AND ((storage.foldername(name))[1] IN ( SELECT (pp.pool_id)::text AS pool_id
   FROM (pool_participants pp
     JOIN pools p ON ((pp.pool_id = p.internal_id)))
  WHERE (((pp.user_id)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) AND (pp."poolRole" = 'mainHost'::"poolRoles"))))));


create policy "Images: Allow main-hosts to upload banner"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] IN ( SELECT (pp.pool_id)::text AS pool_id
   FROM (pool_participants pp
     JOIN pools p ON ((pp.pool_id = p.internal_id)))
  WHERE (((pp.user_id)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) AND (pp."poolRole" = 'mainHost'::"poolRoles")))) AND (storage.filename(name) = 'banner-image.png'::text)));


create policy "Images: Allow user to delete own avatar"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = owner_id) AND (storage.filename(name) = 'avatar.png'::text)));


create policy "Images: Allow user to update own avatar"
on "storage"."objects"
as permissive
for update
to authenticated
using (((((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text) = owner_id) AND (storage.filename(name) = 'avatar.png'::text)));


create policy "Images: Allow users to upload avatar"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)) AND (storage.filename(name) = 'avatar.png'::text)));



