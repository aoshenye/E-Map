from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import CustomUser, UserSummary
from django.db.models.functions import Trunc
from django.db.models import DateTimeField
from django.utils import timezone
from datetime import timedelta
import random

@admin.register(UserSummary)
class UserSummaryAdmin(admin.ModelAdmin):
    change_list_template = 'admin/accounts/user_summary_change_list.html'
    # date_hierarchy = 'created'

    # list_filter = ['is_super']

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(
            request,
            extra_context=extra_context,
        )

        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response

        metrics = {
            # 'total': Count('id'),
            # 'total_sales': Sum('price'),
        }

        response.context_data['summary'] = list(
            qs
        #     .values('username') #.values('sale__category__name')
        #     .annotate(**metrics)
        #     .order_by('last_login')  #.order_by('-total_sales')
        )                            

        summary_over_time = qs.annotate(
            period=Trunc(
                'date_joined',
                'day',
                output_field=DateTimeField(),
            ),
        ).values('period')
        # .annotate(total=Sum('price'))
        # .order_by('period')

        #hardcoding somem values for chart demo purposes
        response.context_data['summary_over_time'] = [{
            'period': x['period'],
            'total': random.randint(0,9),
            'pct': random.randint(10, 100)
        } for x in summary_over_time]

        # Some additional metrics i was working on
        # end_date = timezone.now()
        # start_date = end_date - timedelta(days=7)
        # print(qs.values())
        # print(qs.filter(last_login__range=(start_date.today(), end_date)))
        
        return response


admin.site.register(CustomUser)