"use client";

import Image from "next/image";

import { useDeleteImage } from "@/features/images/api/use-delete-image";
import { useGetImages } from "@/features/images/api/use-get-images";
import { useImageStates } from "@/features/images/hooks/use-image-states";
import { cn } from "@/lib/utils";

import ConfirmDialog from "../ConfirmDialog";
import Empty from "../Empty";
import ImageGridSkeleton from "./ImageGridSkeleton";
import Pagination from "./Pagination";
import ViewDialog from "./ViewDialog";

export default function ImageGrid() {
  const [states, setStates] = useImageStates();

  const { data, isLoading } = useGetImages({
    pageNo: states.page,
    pageSize: states.size,
  });
  const { mutate, isPending } = useDeleteImage({
    onSuccess: () => {
      setStates({
        id: null,
        delete: null,
      });
    },
  });

  const images = data?.list ?? [];
  const total = data?.total ?? 0;

  // 加载状态
  if (isLoading) {
    return <ImageGridSkeleton />;
  }

  // 空状态
  if (!isLoading && images.length === 0) {
    return (
      <Empty
        title="暂无图片"
        description="点击上传按钮添加图片"
        actionLabel="上传图片"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => setStates({ id: image.id })}
          >
            <Image
              src={image.url}
              alt={image.filename}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                "group-hover:scale-105"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* 只有在有数据时才显示分页 */}
      {total > states.size && (
        <div className="mt-4">
          <Pagination
            currentPage={states.page}
            totalPages={Math.ceil(total / states.size)}
            onPageChange={(pageNo) => setStates({ page: pageNo })}
          />
        </div>
      )}

      <ViewDialog
        viewDialogOpen={!!states.id}
        setViewDialogOpen={() => setStates({ id: null })}
        selectedImage={images.find((img) => img.id === states.id)}
        setConfirmDialogOpen={() => setStates({ delete: true })}
      />

      <ConfirmDialog
        open={!!states.delete}
        setOpen={() => setStates({ delete: null })}
        title="确认删除"
        description="确认删除该图片吗？"
        isLoading={isPending}
        onConfirm={() =>
          states.id && mutate({ param: { id: states.id.toString() } })
        }
      />
    </>
  );
}
